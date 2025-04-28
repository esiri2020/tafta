import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {Cohort} from '@prisma/client';

interface CohortState {
  cohort: Cohort | null;
}

const initialState: CohortState = {
  cohort: null,
};

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState,
  reducers: {
    setCohort: (state, action: PayloadAction<Cohort | null>) => {
      state.cohort = action.payload;
    },
  },
});

export const {setCohort} = cohortSlice.actions;

export const selectCohort = (state: RootState) => state.cohort.cohort;
