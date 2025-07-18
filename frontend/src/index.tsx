import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "App";
import { Provider } from "react-redux";
import store from "./reduxComponents/store";
import "mdb-react-ui-kit/dist/css/mdb.min.css";


const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
reportWebVitals();
