import "./style.css";
import { onCleanup, createState, createEffect, createSignal } from "solid-js";
import { render, For, Show } from "solid-js/dom";
import { SetStateFunction, Wrapped } from "solid-js/types/state";

function createLocalState<T>(initState: T): [Wrapped<T>, SetStateFunction<T>] {
  const [state, setState] = createState(initState);
  if (localStorage.todos) {
    let parsed = JSON.parse(localStorage.todos);
    parsed.time = new Date(parsed.time);
    setState(parsed);
  }
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
type Todo = { title: string; done: boolean; id: number };
const App = () => {
  const [state, setState] = createLocalState({
    time: addSeconds(25 * 60),
    newTitle: "",
    todos: [] as Todo[],
    nextId: 0,
    paused: undefined as undefined | number,
    displayedNotification: false,
  });
  const [toggle, setToggle] = createSignal(false);

  let timer: NodeJS.Timeout | undefined = undefined;
  const tick = () => {
    console.log(posmod(state.time.getTime() - Date.now(), 1000));
    setToggle(!toggle());
    if (state.paused == undefined && Date.now() >= state.time.getTime()) {
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
    let offset = posmod(state.time.getTime() - Date.now(), 1000);
    timer = setTimeout(tick, offset <= 1 ? 1000 : offset);
  };

  if (state.paused != undefined) {
    tick();
  }
  onCleanup(() => clearTimeout(timer!));

  return (
    <>
      <section class="hero">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 class="title is-1">
              {state.paused != undefined ? displaySecs(state.paused) : [toggle(), deltaDisplay(state.time)][1]}
            </h1>
            <div class="field has-addons has-addons-centered">
              <div class="control">
                <button
                  class="button"
                  onClick={() => {
                    if (state.paused != undefined) {
                      setState("time", addSeconds(state.paused));
                      setState("paused", undefined);
                      clearTimeout(timer!);
                      tick();
                    } else {
                      setState("paused", Math.max((state.time.getTime() - Date.now()) / 1000, 0));
                      clearTimeout(timer!);
                      timer = undefined;
                    }
                  }}
                >
                  {state.paused == undefined ? "Pause" : "Play"}
                </button>
              </div>
              <div class="control">
                <button
                  class="button"
                  onClick={() => {
                    setState("paused", 10 * 60);
                    setState("displayedNotification", false);
                    clearTimeout(timer!);
                    timer = undefined;
                  }}
                >
                  Reset
                </button>
              </div>
              <Show when={!state.paused && state.time.getTime() <= Date.now()}>
                <div class="control">
                  <button class="button" onClick={() => setState("todos", [])}>
                    Clear Todos
                  </button>
                </div>
              </Show>
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
                    s.todos.push({
                      title: state.newTitle,
                      done: false,
                      id: s.nextId,
                    });
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
                  <div
                    class="button"
                    onClick={(e) => {
                      const idx = state.todos.findIndex((t) => t.id === todo.id);
                      setState("todos", idx, "done", (done: boolean) => !done);
                    }}
                  >
                    <input type="checkbox" checked={todo.done}></input>
                  </div>
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
