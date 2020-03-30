import "./style.css";
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
const a = new AudioContext();

function beep() {
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
      } else {
        a.resume();
        beep();
        setTimeout(() => beep(), 200);
        setTimeout(() => beep(), 400);
        setTimeout(() => beep(), 600);
      }
    }
  }, 1000);
  onCleanup(() => clearInterval(timer));

  return (
    <>
      <section class="hero">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 class="title is-1">{Math.floor(state.time / 60) + ":" + ((state.time % 60) + "").padStart(2, "0")}</h1>
            <div class="field has-addons has-addons-centered">
              <div class="control">
                <button
                  class="button"
                  onClick={() => {
                    setState("paused", (p) => !p);
                  }}
                >
                  {state.paused ? "Play" : "Pause"}
                </button>
              </div>
              <div class="control">
                <button
                  class="button"
                  onClick={() => {
                    setState("time", 10);
                    setState("displayedNotification", false);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="field has-addons has-addons-centered">
            <div class="control">
              <input
                type="text"
                class="input"
                placeholder="enter a todo and click +"
                value={state.newTitle}
                onInput={(e) => setState({ newTitle: e.target.value })}
              ></input>
            </div>
            <div class="control">
              <a
                class="button is-info"
                onClick={() => {
                  setState((s) => {
                    s.todos.push({ title: state.newTitle, done: false, id: s.nextId });
                    s.newTitle = "";
                    s.nextId++;
                  });
                }}
              >
                +
              </a>
            </div>
          </div>
          <For each={state.todos}>
            {(todo) => (
              <div class="field has-addons has-addons-centered">
                <div class="control">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onClick={(e) => {
                      const idx = state.todos.findIndex((t) => t.id === todo.id);
                      setState("todos", idx, { done: e.target.checked });
                    }}
                  ></input>
                </div>
                <div class="control">
                  <input
                    type="text"
                    class="input"
                    value={todo.title}
                    onInput={(e) => {
                      const idx = state.todos.findIndex((t) => t.id === todo.id);
                      setState("todos", idx, { title: e.target.value });
                    }}
                  ></input>
                </div>
                <div class="control">
                  <button class="button" onClick={() => setState("todos", (t) => t.filter((t) => t.id !== todo.id))}>
                    x
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </section>
    </>
  );
};

render(App, document.getElementById("main")!);
