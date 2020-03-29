import { createState, onCleanup } from "solid-js";
import { render } from "solid-js/dom";

const App = () => {
  const [state, setState] = createState({ count: 0 }),
    timer = setInterval(() => setState("count", (c) => c + 1), 1000);
  onCleanup(() => clearInterval(timer));

  return <div>{state.count}</div>;
};

render(App, document.getElementById("main")!);
