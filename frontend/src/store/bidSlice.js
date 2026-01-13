import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const data = await api.post('/bids', bidData);
      return data.bid;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/bids/my-bids');
      return data.bids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/bids/${gigId}`);
      return data.bids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const data = await api.patch(`/bids/${bidId}/hire`);
      return data.bid;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    myBids: [],
    gigBids: [],
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
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids.unshift(action.payload);
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my bids
      .addCase(fetchMyBids.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch bids for gig
      .addCase(fetchBidsForGig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.loading = false;
        state.gigBids = action.payload;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Hire bid
      .addCase(hireBid.fulfilled, (state, action) => {
        const hiredBid = action.payload;
        state.gigBids = state.gigBids.map(bid => 
          bid._id === hiredBid._id 
            ? hiredBid 
            : { ...bid, status: 'rejected' }
        );
      });
  }
});

export const { clearError } = bidSlice.actions;
export default bidSlice.reducer;
