import "virtual:windi.css";
import { onCleanup, createEffect, createSignal, For } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { render } from "solid-js/web";

function createLocalState<T extends object>(initState: T): [T, SetStoreFunction<T>] {
  const [state, setState] = createStore<T>(initState);
  if (localStorage.todos) {
    let parsed = JSON.parse(localStorage.todos);
    if (typeof parsed.time == "string") parsed.time = new Date(parsed.time);
    setState(parsed);
  }
  createEffect(() => (localStorage.todos = JSON.stringify(state)));
  return [state, setState];
}

Notification.requestPermission();
const a = new AudioContext();

function addSeconds(s: number): Date {
  return new Date(Date.now() + s * 1000);
}
function deltaDisplay(d: Date): string {
  let now = Math.max(d.getTime() - Date.now(), 0);
  let sec = Math.ceil(now / 1000);
  let min = Math.floor(sec / 60);
  return min + ":" + ((sec % 60) + "").padStart(2, "0");
}
function displaySecs(s: number): string {
  return Math.floor(Math.ceil(s) / 60) + ":" + ((Math.ceil(s) % 60) + "").padStart(2, "0");
}
function posmod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
function isPaused(t: Time): t is number {
  return typeof t == "number";
}
type Time = Date | number;
type Todo = { title: string; done: boolean };
const App = () => {
  const [state, setState] = createLocalState({
    time: addSeconds(25 * 60) as Time,
    newTitle: "",
    todos: [] as Todo[],
    displayedNotification: false,
  });
  const [toggle, setToggle] = createSignal(false);

  let timer: number | undefined = undefined;

  function beep() {
    if (isPaused(state.time)) return;
    const duration = 0.05;
    const v = a.createOscillator();
    const u = a.createGain();
    v.connect(u);
    v.frequency.value = 1200;
    v.type = "square";
    u.connect(a.destination);
    u.gain.value = 0.1;
    u.gain.setValueAtTime(0.1, a.currentTime + duration);
    u.gain.linearRampToValueAtTime(0, a.currentTime + duration + 0.05);
    v.start(a.currentTime);
    v.stop(a.currentTime + duration + 0.05);
  }

  const tick = () => {
    setToggle(!toggle());
    if (!isPaused(state.time) && Date.now() >= state.time.getTime()) {
      if (!state.displayedNotification) {
        setState("displayedNotification", true);
        new Notification("The timer is up!");
      }
      a.resume();
      beep();
      setTimeout(() => beep(), 200);
      setTimeout(() => beep(), 400);
      setTimeout(() => beep(), 600);
    }
    if (!isPaused(state.time)) {
      let offset = posmod(state.time.getTime() - Date.now(), 1000);
      timer = setTimeout(tick as TimerHandler, offset <= 1 ? 1000 : offset);
    } else timer = undefined;
  };

  if (!isPaused(state.time)) tick();
  onCleanup(() => clearTimeout(timer!));

  let createButton = (time: number, classes: string) => (
    <div class="control">
      <button
        class={`bg-blue-100 hover:bg-blue-200 text-black py-2 px-4 ${classes}`}
        onClick={() => {
          setState("time", time * 60);
          setState("displayedNotification", false);
        }}
      >
        {time} minutes
      </button>
    </div>
  );

  let addTodo = () => {
    setState((s) => ({
      todos: [
        {
          title: s.newTitle,
          done: false,
        },
        ...s.todos,
      ],
      newTitle: "",
    }));
  };

  return (
    <>
      <section class="container mx-auto text-center">
        <div class="inline-flex">
          {createButton(25, "rounded-l")}
          {createButton(10, "")}
          {createButton(5, "rounded-r")}
        </div>
        <h1 style="font-size:6rem;font-weight:600;">{isPaused(state.time) ? displaySecs(state.time) : [toggle(), deltaDisplay(state.time)][1]}</h1>
        <button
          class="py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => {
            if (isPaused(state.time)) {
              setState("time", addSeconds(state.time));
              clearTimeout(timer!);
              tick();
            } else {
              setState("time", Math.max((state.time.getTime() - Date.now()) / 1000, 0));
            }
          }}
        >
          {isPaused(state.time) ? "Play" : "Pause"}
        </button>
      </section>
      <section class="container mx-auto text-center" style="width: 340px">
        <div class="inline-flex w-full pt-4 pb-4">
          <input
            type="text"
            class="appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 border-gray-200 hover:border-gray-300 hover:z-10"
            placeholder="enter a todo and click +"
            value={state.newTitle}
            onKeyDown={(e) => e.key == "Enter" && addTodo()}
            onInput={(e) => setState({ newTitle: e.currentTarget.value })}
          ></input>
          <button class="text-white py-2 px-4 rounded-r bg-blue-500 hover:bg-blue-700" onClick={addTodo}>
            +
          </button>
        </div>
        <For each={state.todos}>
          {(todo, idx) => (
            <div class="inline-flex w-full" style="margin-bottom:-1px">
              <div
                class="text-black py-2 px-4 rounded-l border border-gray-200 hover:border-gray-300 hover:z-10"
                classList={{ "bg-gray-200": todo.done }}
                onClick={() => setState("todos", idx(), "done", (done) => !done)}
              >
                <input type="checkbox" checked={todo.done}></input>
              </div>
              <input
                type="text"
                class="appearance-none border border-gray-200 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:z-20 hover:border-gray-300 hover:z-10"
                classList={{
                  "bg-gray-200": todo.done,
                  "line-through": todo.done,
                }}
                style="margin-left:-1px;margin-right:-1px;"
                value={todo.title}
                onInput={(e) => setState("todos", idx(), { title: e.currentTarget.value })}
              ></input>
              <button
                class="text-black py-2 px-4 rounded-r border border-gray-200 hover:border-gray-300 hover:z-10"
                classList={{ "bg-gray-200": todo.done }}
                onClick={() => setState("todos", (t) => [...t.slice(0, idx()), ...t.slice(idx() + 1)])}
              >
                x
              </button>
            </div>
          )}
        </For>
      </section>
    </>
  );
};

render(App, document.getElementById("main")!);
