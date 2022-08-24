# Vis

## How to use

Install it and run:

```sh
npm install
npm run dev
```

## Notes

1. The material-ui theme is copied from your original app's `theme.js` file, except primary light color is newly added.

2. The data are managed by the `DataContext.js`. Make sure you modify your original `pages/_app.js`

```js
import { DataProvider } from "../src/context/DataContext";
export default function MyApp(props) {
  return <DataProvider>...</DataProvider>;
}
```

3. To update the user's data, you need to use `useDataDispatch` hook

```js
import { useDataDispatch } from "../context/DataContext";

export default function YourDataUploadComponent() {
  const dispatch = useDataDispatch();
  dispatch({
    type: "update",
    id: "user",
    data: userUploadedData,
  });
}
```

4. To adjust the initial data loaded between user and community, adjust `DataContext.js`, the `initialData`'s `selected` property value.

```js
const initialData = [
  {
    id: "user",
    data: [],
    selected: false,
  },
  {
    id: "community",
    data: communityData,
    selected: true,
  },
];
```

You can also change it later in other components by using `useDataDispatch` hook

```js
import { useDataDispatch } from "../context/DataContext";

export default function SomeComponent() {
  const dispatch = useDataDispatch();
  dispatch({
    type: "select",
    id: "user", // or "community"
  });
}
```

5. The visualization stylesheet is `vis.css` in the `styles` folder. Please make sure you import that in `_app.index` in `pages` folder.
