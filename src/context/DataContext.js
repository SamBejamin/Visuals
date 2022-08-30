import communityData from "../data/StreamingHistory.json";
import yourData from "../data/StreamingHistory0.json";
import yourData2 from "../data/StreamingHistory1.json";
import yourData3 from "../data/StreamingHistory2.json";
import yourData4 from "../data/StreamingHistory3.json";
import yourData5 from "../data/StreamingHistory4.json";
import yourData6 from "../data/StreamingHistory5.json";
import yourData7 from "../data/StreamingHistory6.json";
import yourData8 from "../data/StreamingHistory7.json";
import yourData9 from "../data/StreamingHistory8.json";
import yourData10 from "../data/StreamingHistory9.json";
import { createContext, useContext, useReducer } from "react";

const DataContext = createContext(null);

const DataDispatchContext = createContext(null);

export function DataProvider({ children }) {
  const [data, dispatch] = useReducer(dataReducer, initialData);

  return (
    <DataContext.Provider value={data}>
      <DataDispatchContext.Provider value={dispatch}>
        {children}
      </DataDispatchContext.Provider>
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

export function useDataDispatch() {
  return useContext(DataDispatchContext);
}

function dataReducer(data, action) {
  switch (action.type) {
    case "update":
      return data.map((d) => {
        if (d.id === action.id) {
          return {
            ...d,
            data: transformData(action.data),
          };
        } else {
          return d;
        }
      });
    case "select":
      return data.map((d) => {
        if (d.id === action.id) {
          return {
            ...d,
            selected: true,
          };
        } else {
          return {
            ...d,
            selected: false,
          };
        }
      });
    default:
      throw Error("Unknown action: " + action.type);
  }
}

function transformData(data) {
  const parseTime = (d) => {
    return new Date(d.slice(0, 10));
  };

  const msToHours = (d) => {
    return d / (1000 * 60 * 60);
  };

  return data.map((d) => ({
    artistName: d.artistName,
    trackName: d.trackName,
    date: parseTime(d.endTime),
    hoursPlayed: msToHours(d.msPlayed),
  }));
}

const initialData = [
  {
    id: "user1",
    data: transformData(yourData),
    selected: true,
  },
  {
    id: "user2",
    data: transformData(yourData2),
    selected: false,
  },
  {
    id: "user3",
    data: transformData(yourData3),
    selected: false,
  },
  {
    id: "user4",
    data: transformData(yourData4),
    selected: false,
  },
  {
    id: "user5",
    data: transformData(yourData5),
    selected: false,
  },
  {
    id: "user6",
    data: transformData(yourData6),
    selected: false,
  },
  {
    id: "user7",
    data: transformData(yourData7),
    selected: false,
  },
  {
    id: "user8",
    data: transformData(yourData8),
    selected: false,
  },
  {
    id: "user9",
    data: transformData(yourData9),
    selected: false,
  },
  {
    id: "user10",
    data: transformData(yourData10),
    selected: false,
  },
  {
    id: "community",
    data: transformData(communityData),
    selected: true,
  },
];
