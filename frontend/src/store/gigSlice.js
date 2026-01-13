import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async ({ search = '', status = 'open' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const data = await api.get(`/gigs?${params.toString()}`);
      return data.gigs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/gigs/my-gigs');
      return data.gigs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const data = await api.post('/gigs', gigData);
      return data.gig;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGig = createAsyncThunk(
  'gigs/deleteGig',
  async (gigId, { rejectWithValue }) => {
    try {
      await api.delete(`/gigs/${gigId}`);
      return gigId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    myGigs: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my gigs
      .addCase(fetchMyGigs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.myGigs = action.payload;
      })
      .addCase(fetchMyGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create gig
      .addCase(createGig.fulfilled, (state, action) => {
        state.myGigs.unshift(action.payload);
        state.gigs.unshift(action.payload);
      })
      // Delete gig
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.myGigs = state.myGigs.filter(gig => gig._id !== action.payload);
        state.gigs = state.gigs.filter(gig => gig._id !== action.payload);
      });
  }
});

export const { clearError } = gigSlice.actions;
export default gigSlice.reducer;
