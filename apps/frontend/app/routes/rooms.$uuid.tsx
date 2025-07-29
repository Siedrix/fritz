import type { Route } from "./+types/rooms.$uuid";
import { Form, Link, redirect } from "react-router";
import { getCounter, incrementCounter, deleteCounter, type CounterData } from "../actions/counter";

export async function action({ request, params }: Route.ActionArgs) {
  const { uuid } = params;
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (request.method === "POST") {
    if (action === "delete") {
      await deleteCounter(uuid);
      return redirect("/");
    } else {
      return await incrementCounter(uuid);
    }
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const { uuid } = params;
  const counter = await getCounter(uuid);
  return { counter, uuid };
}

export default function Room({ loaderData, actionData }: Route.ComponentProps) {
  const counter = actionData || loaderData.counter;
  const { uuid } = loaderData;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-navy-800 rounded-lg shadow-lg p-6 border border-navy-600">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              ← Back to Rooms
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-100">
            Room Counter
          </h1>
          <p className="text-center text-sm text-gray-300 mb-6">
            Room ID: {uuid}
          </p>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {counter.count}
            </div>
            <div className="text-sm text-gray-300">
              Last clicked: {new Date(counter.lastClick).toLocaleString()}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <Form method="post">
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mr-4"
              >
                Click Me!
              </button>
            </Form>
            
            <Form method="post">
              <input type="hidden" name="action" value="delete" />
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                onClick={(e) => {
                  if (!confirm('Are you sure you want to delete this counter?')) {
                    e.preventDefault();
                  }
                }}
              >
                Delete Counter
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}