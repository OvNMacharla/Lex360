import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ConsultationService from '../services/database/consultationService';

// ------- Thunks -------

// Create consultation
export const createConsultation = createAsyncThunk(
  'consultations/createConsultation',
  async (consultationData, { rejectWithValue }) => {
    const res = await ConsultationService.createConsultation(consultationData);
    if (!res.success) return rejectWithValue(res.error);
    return res.consultationId;
  }
);

// Fetch consultations for a user
export const getUserConsultations = createAsyncThunk(
  'consultations/getUserConsultations',
  async ({ userId, role }, { rejectWithValue }) => {
    const res = await ConsultationService.getUserConsultations(userId, role);
    if (!res.success) return rejectWithValue(res.error);
    return res.data;
  }
);

// Update consultation status
export const updateConsultationStatus = createAsyncThunk(
  'consultations/updateConsultationStatus',
  async ({ consultationId, status, note }, { rejectWithValue }) => {
    const res = await ConsultationService.updateConsultationStatus(consultationId, status, note);
    if (!res.success) return rejectWithValue(res.error);
    return { consultationId, status, note };
  }
);

// Delete consultation
export const deleteConsultation = createAsyncThunk(
  'consultations/deleteConsultation',
  async (consultationId, { rejectWithValue }) => {
    const res = await ConsultationService.deleteConsultation(consultationId);
    if (!res.success) return rejectWithValue(res.error);
    return consultationId;
  }
);

// Update consultation details
export const updateConsultation = createAsyncThunk(
  'consultations/updateConsultation',
  async ({ consultationId, patchData }, { rejectWithValue }) => {
    try {
      const res = await ConsultationService.updateConsultation(consultationId, patchData);
      if (!res.success) return rejectWithValue(res.error);
      return {
        success: res.success,
        consultationId,
        data: res.data,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update consultation');
    }
  }
);

// Fetch consultation details
export const getConsultationDetails = createAsyncThunk(
  'consultations/getConsultationDetails',
  async (consultationId, { rejectWithValue }) => {
    const res = await ConsultationService.getConsultationDetails(consultationId);
    if (!res.success) return rejectWithValue(res.error);
    return res.data;
  }
);

// ------- Slice -------
const consultationSlice = createSlice({
  name: 'consultations',
  initialState: {
    consultations: [],      // list
    selectedConsultation: null, // single
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedConsultation: (state) => { state.selectedConsultation = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createConsultation.pending, (s) => { s.loading = true; })
      .addCase(createConsultation.fulfilled, (s) => { s.loading = false; })
      .addCase(createConsultation.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Fetch list
      .addCase(getUserConsultations.pending, (s) => { s.loading = true; })
      .addCase(getUserConsultations.fulfilled, (s, a) => { s.loading = false; s.consultations = a.payload; })
      .addCase(getUserConsultations.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Update status
      .addCase(updateConsultationStatus.pending, (s) => { s.loading = true; })
      .addCase(updateConsultationStatus.fulfilled, (s, a) => {
        s.loading = false;
        const { consultationId, status, note } = a.payload;
        const idx = s.consultations.findIndex(c => c.id === consultationId);
        if (idx !== -1) {
          s.consultations[idx].status = status;
          s.consultations[idx].timeline = [
            ...(s.consultations[idx].timeline || []),
            { status, note, timestamp: new Date().toISOString() },
          ];
        }
        if (s.selectedConsultation?.id === consultationId) {
          s.selectedConsultation = { ...s.selectedConsultation, status };
        }
      })
      .addCase(updateConsultationStatus.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Delete
      .addCase(deleteConsultation.pending, (s) => { s.loading = true; })
      .addCase(deleteConsultation.fulfilled, (s, a) => {
        s.loading = false;
        s.consultations = s.consultations.filter(c => c.id !== a.payload);
      })
      .addCase(deleteConsultation.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Update consultation details
      .addCase(updateConsultation.pending, (s) => { s.loading = true; })
      .addCase(updateConsultation.fulfilled, (s, a) => {
        s.loading = false;
        const { consultationId, data } = a.payload;
        const idx = s.consultations.findIndex(c => c.id === consultationId);
        if (idx !== -1) {
          s.consultations[idx] = { ...s.consultations[idx], ...data };
        }
        if (s.selectedConsultation?.id === consultationId) {
          s.selectedConsultation = { ...s.selectedConsultation, ...data };
        }
      })
      .addCase(updateConsultation.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Get details
      .addCase(getConsultationDetails.pending, (s) => { s.loading = true; })
      .addCase(getConsultationDetails.fulfilled, (s, a) => { s.loading = false; s.selectedConsultation = a.payload; })
      .addCase(getConsultationDetails.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearSelectedConsultation, clearError } = consultationSlice.actions;

// ------- Selectors -------
export const selectConsultations = (state) => state.consultations;
export const selectSelectedConsultation = (state) => state.consultations.selectedConsultation;
export const selectConsultationLoading = (state) => state.consultations.loading;
export const selectConsultationError = (state) => state.consultations.error;

export default consultationSlice.reducer;
