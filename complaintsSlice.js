import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (_, { getState }) => {
    const { filters } = getState().complaints;
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.risk_level && filters.risk_level !== 'All') params.append('risk_level', filters.risk_level);
    if (filters.dosage_form && filters.dosage_form !== 'All') params.append('dosage_form', filters.dosage_form);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);

    const res = await axios.get(`${API_BASE}/complaints?${params.toString()}`);
    return res.data;
  }
);

export const fetchComplaintDetail = createAsyncThunk(
  'complaints/fetchComplaintDetail',
  async (complaintId) => {
    const res = await axios.get(`${API_BASE}/complaints/${complaintId}`);
    return res.data;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'complaints/fetchDashboardStats',
  async () => {
    const res = await axios.get(`${API_BASE}/dashboard/stats`);
    return res.data;
  }
);

export const ingestComplaint = createAsyncThunk(
  'complaints/ingestComplaint',
  async (payload, { getState, dispatch }) => {
    const { groqApiKey } = getState().complaints;
    const body = {
      ...payload,
      groq_api_key: groqApiKey || payload.groq_api_key || null
    };

    const res = await axios.post(`${API_BASE}/complaints/ingest`, body);
    dispatch(fetchComplaints());
    dispatch(fetchDashboardStats());
    return res.data;
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateComplaintStatus',
  async ({ complaintId, status, note }, { dispatch }) => {
    const res = await axios.put(`${API_BASE}/complaints/${complaintId}/status`, {
      status,
      note,
      updated_by: 'QA Manager'
    });
    dispatch(fetchComplaints());
    dispatch(fetchDashboardStats());
    return res.data;
  }
);

export const reanalyzeComplaint = createAsyncThunk(
  'complaints/reanalyzeComplaint',
  async (complaintId, { getState }) => {
    const { groqApiKey } = getState().complaints;
    const res = await axios.post(`${API_BASE}/complaints/${complaintId}/reanalyze`, {
      groq_api_key: groqApiKey || null
    });
    return res.data;
  }
);

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    list: [],
    activeComplaint: null,
    dashboardStats: null,
    filters: {
      search: '',
      risk_level: 'All',
      dosage_form: 'All',
      status: 'All'
    },
    activeTab: 'intake', // 'intake' | 'dashboard' | 'registry' | 'detail'
    detailSubTab: 'ai_intelligence', // 'ai_intelligence' | 'overview' | 'workflow_trace' | 'audit_log'
    groqApiKey: localStorage.getItem('GROQ_API_KEY') || '',
    ingestModalOpen: false,
    groqModalOpen: false,
    isIngesting: false,
    ingestStep: 0,
    loading: false,
    error: null
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDetailSubTab: (state, action) => {
      state.detailSubTab = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setGroqApiKey: (state, action) => {
      state.groqApiKey = action.payload;
      localStorage.setItem('GROQ_API_KEY', action.payload);
    },
    setIngestModalOpen: (state, action) => {
      state.ingestModalOpen = action.payload;
    },
    setGroqModalOpen: (state, action) => {
      state.groqModalOpen = action.payload;
    },
    setIngestStep: (state, action) => {
      state.ingestStep = action.payload;
    },
    clearActiveComplaint: (state) => {
      state.activeComplaint = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchComplaints
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchComplaintDetail
      .addCase(fetchComplaintDetail.fulfilled, (state, action) => {
        state.activeComplaint = action.payload;
      })
      // fetchDashboardStats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      // ingestComplaint
      .addCase(ingestComplaint.pending, (state) => {
        state.isIngesting = true;
        state.ingestStep = 1;
      })
      .addCase(ingestComplaint.fulfilled, (state, action) => {
        state.isIngesting = false;
        state.ingestStep = 7; // complete
        state.activeComplaint = action.payload;
        state.activeTab = 'detail';
        state.ingestModalOpen = false;
      })
      .addCase(ingestComplaint.rejected, (state, action) => {
        state.isIngesting = false;
        state.error = action.error.message;
      })
      // updateComplaintStatus
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        state.activeComplaint = action.payload;
      })
      // reanalyzeComplaint
      .addCase(reanalyzeComplaint.fulfilled, (state, action) => {
        state.activeComplaint = action.payload;
      });
  }
});

export const {
  setActiveTab,
  setDetailSubTab,
  setFilter,
  setGroqApiKey,
  setIngestModalOpen,
  setGroqModalOpen,
  setIngestStep,
  clearActiveComplaint
} = complaintsSlice.actions;

export default complaintsSlice.reducer;
