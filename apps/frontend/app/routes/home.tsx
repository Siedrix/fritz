import type { Route } from "./+types/home";
import { Form, Link, redirect } from "react-router";
import { getAllCounters, createCounter, type CounterWithUuid } from "../actions/counter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const action = formData.get("action");
    
    if (action === "create") {
      const newUuid = await createCounter();
      return redirect(`/rooms/${newUuid}`);
    }
  }
}

export async function loader() {
  const counters = await getAllCounters();
  return { counters };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { counters }: { counters: CounterWithUuid[] } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Counter Rooms
          </h1>
          
          <div className="mb-8">
            <Form method="post" className="text-center">
              <input type="hidden" name="action" value="create" />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Create New Room
              </button>
            </Form>
          </div>
          
          {counters.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              No rooms yet. Create your first room!
            </div>
          ) : (
            <div className="grid gap-4">
              {counters.map((counter) => (
                <Link
                  key={counter.uuid}
                  to={`/rooms/${counter.uuid}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Room {counter.uuid.slice(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last activity: {new Date(counter.lastClick).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {counter.count}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
