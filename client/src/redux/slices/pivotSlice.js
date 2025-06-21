import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../lib/queryClient';

export const fetchPivots = createAsyncThunk(
  'pivots/fetch',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/api/pivots', {
        method: 'GET',
        params: filters
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPivot = createAsyncThunk(
  'pivots/create',
  async (pivotData, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/api/pivots', {
        method: 'POST',
        body: JSON.stringify(pivotData)
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePivot = createAsyncThunk(
  'pivots/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/api/pivots/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const pivotSlice = createSlice({
  name: 'pivots',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
    filters: {},
    selectedPivot: null,
    metrics: {
      totalValue: 0,
      completedCount: 0,
      inProgressCount: 0,
      availableCount: 0
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedPivot: (state, action) => {
      state.selectedPivot = action.payload;
    },
    updatePivotStatus: (state, action) => {
      const { id, status } = action.payload;
      const pivot = state.list.find(p => p.id === id);
      if (pivot) {
        pivot.status = status;
      }
    },
    calculateMetrics: (state) => {
      const metrics = state.list.reduce((acc, pivot) => {
        acc.totalValue += pivot.estimatedValue || 0;
        
        switch (pivot.status) {
          case 'completed':
            acc.completedCount++;
            break;
          case 'in_progress':
            acc.inProgressCount++;
            break;
          case 'available':
            acc.availableCount++;
            break;
          default:
            break;
        }
        return acc;
      }, {
        totalValue: 0,
        completedCount: 0,
        inProgressCount: 0,
        availableCount: 0
      });
      
      state.metrics = metrics;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pivots
      .addCase(fetchPivots.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPivots.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        pivotSlice.caseReducers.calculateMetrics(state);
      })
      .addCase(fetchPivots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Pivot
      .addCase(createPivot.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPivot.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list.push(action.payload);
        pivotSlice.caseReducers.calculateMetrics(state);
      })
      .addCase(createPivot.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update Pivot
      .addCase(updatePivot.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePivot.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        pivotSlice.caseReducers.calculateMetrics(state);
      })
      .addCase(updatePivot.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  setSelectedPivot, 
  updatePivotStatus, 
  calculateMetrics 
} = pivotSlice.actions;

export default pivotSlice.reducer;