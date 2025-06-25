import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedHistoryId: string | null;
}

const initialState: UIState = {
  selectedHistoryId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedHistoryId(state, action: PayloadAction<string | null>) {
      state.selectedHistoryId = action.payload;
    },
  },
});

export const { setSelectedHistoryId } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 