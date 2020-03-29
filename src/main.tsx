import { onCleanup, createState, createEffect } from "solid-js";
import { render, For } from "solid-js/dom";
import { SetStateFunction, Wrapped } from "solid-js/types/state";

function createLocalState<T>(initState: T): [Wrapped<T>, SetStateFunction<T>] {
  const [state, setState] = createState(initState);
  if (localStorage.todos) setState(JSON.parse(localStorage.todos));
  createEffect(() => (localStorage.todos = JSON.stringify(state)));
  return [state, setState];
}

Notification.requestPermission();
type Todo = { title: string; done: boolean; id: number };
const App = () => {
  const [state, setState] = createLocalState({
    time: 25 * 60,
    newTitle: "",
    todos: [] as Todo[],
    nextId: 0,
    paused: false,
    displayedNotification: false,
  });
  const timer = setInterval(() => {
    if (!state.paused) {
      if (state.time > 0) setState("time", (t) => t - 1);
      else if (!state.displayedNotification) {
        setState("displayedNotification", true);
        new Notification("The timer is up!");
      }
    }
  }, 1000);
  onCleanup(() => clearInterval(timer));

  return (
    <div>
      <h1>{Math.floor(state.time / 60) + ":" + ((state.time % 60) + "").padStart(2, "0")}</h1>
      <div>
        <button
          onClick={() => {
            setState("paused", (p) => !p);
          }}
        >
          {state.paused ? "Play" : "Pause"}
        </button>
        <button
          onClick={() => {
            setState("time", 10);
            setState("displayedNotification", false);
          }}
        >
          Reset
        </button>
      </div>
      <input
        type="text"
        placeholder="enter a todo and click +"
        value={state.newTitle}
        onInput={(e) => setState({ newTitle: e.target.value })}
      ></input>
      <button
        onClick={() => {
          setState((s) => {
            s.todos.push({ title: state.newTitle, done: false, id: s.nextId });
            s.newTitle = "";
            s.nextId++;
          });
        }}
      >
        +
      </button>
      <For each={state.todos}>
        {(todo) => (
          <div>
            <input
              type="checkbox"
              checked={todo.done}
              onClick={(e) => {
                const idx = state.todos.findIndex((t) => t.id === todo.id);
                setState("todos", idx, { done: e.target.checked });
              }}
            ></input>
            <input
              value={todo.title}
              onInput={(e) => {
                const idx = state.todos.findIndex((t) => t.id === todo.id);
                setState("todos", idx, { title: e.target.value });
              }}
            ></input>
            <button onClick={() => setState("todos", (t) => t.filter((t) => t.id !== todo.id))}>x</button>
          </div>
        )}
      </For>
    </div>
  );
};

render(App, document.getElementById("main")!);
