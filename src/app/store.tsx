import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Patient } from "./types";
import { seedPatients } from "./seed";

type State = {
  patients: Patient[];
};

type Action =
  | { type: "INIT"; payload: State }
  | { type: "ADD_PATIENT"; payload: Patient }
  | { type: "UPDATE_PATIENT"; payload: Patient };

const LS_KEY = "uci_donante_activa_ia_state_v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return action.payload;
    case "ADD_PATIENT":
      return { ...state, patients: [action.payload, ...state.patients] };
    case "UPDATE_PATIENT":
      return {
        ...state,
        patients: state.patients.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    default:
      return state;
  }
}

const StoreCtx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { patients: [] });

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      dispatch({ type: "INIT", payload: JSON.parse(raw) as State });
    } else {
      dispatch({ type: "INIT", payload: { patients: seedPatients() } });
    }
  }, []);

  useEffect(() => {
    if (state.patients.length) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}