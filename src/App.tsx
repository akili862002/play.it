import MainLayout from "layouts/Main";
import HomeV2 from "pages/home";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import "./styles/index.scss";

const HomePage = lazy(() => import("./pages/home"));
const Playlist = lazy(() => import("./pages/playlist"));

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback="Loading...">
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/playlist/:id" exact component={Playlist} />
            <Redirect from="*" to="/" />
          </Switch>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
