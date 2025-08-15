import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CaseService from '../services/database/caseService';

// ------- Existing case thunks (keep from your earlier slice) -------
export const createCase = createAsyncThunk('cases/createCase', async (caseData, { rejectWithValue }) => {
  const res = await CaseService.createCase(caseData);
  if (!res.success) return rejectWithValue(res.error);
  return res.caseId;
});

export const getUserCases = createAsyncThunk('cases/getUserCases', async ({ userId, userRole }, { rejectWithValue }) => {
  const res = await CaseService.getUserCases(userId, userRole);
  if (!res.success) return rejectWithValue(res.error);
  return res.data;
});

export const updateCaseStatus = createAsyncThunk('cases/updateCaseStatus', async ({ caseId, status, note }, { rejectWithValue }) => {
  const res = await CaseService.updateCaseStatus(caseId, status, note);
  if (!res.success) return rejectWithValue(res.error);
  return { caseId, status, note };
});

export const deleteCase = createAsyncThunk('cases/deleteCase', async (caseId, { rejectWithValue }) => {
  const res = await CaseService.deleteCase(caseId);
  if (!res.success) return rejectWithValue(res.error);
  return caseId;
});

export const updateCase = createAsyncThunk(
  'cases/updateCase', 
  async ({ caseId, patchData }, { rejectWithValue }) => {
    try {
      const res = await CaseService.updateCase(caseId, patchData);
      
      if (!res.success) {
        return rejectWithValue(res.error);
      }
      
      // Return the full response object, not just data
      return {
        success: res.success,
        caseId,
        data: res.data
      };
    } catch (error) {
      console.error('Redux updateCase error:', error);
      return rejectWithValue(error.message || 'Failed to update case');
    }
  }
);

export const addCaseDocument = createAsyncThunk('cases/addCaseDocument', async ({ caseId, documentData }, { rejectWithValue }) => {
  const res = await CaseService.addCaseDocument(caseId, documentData);
  if (!res.success) return rejectWithValue(res.error);
  return { caseId, documentData };
});

export const getCaseDetails = createAsyncThunk('cases/getCaseDetails', async (caseId, { rejectWithValue }) => {
  const res = await CaseService.getCaseDetails(caseId);
  if (!res.success) return rejectWithValue(res.error);
  return res.data;
});

// ------- Subtasks thunks (NEW) -------
export const fetchSubtasks = createAsyncThunk('cases/fetchSubtasks', async (caseId, { rejectWithValue }) => {
  const res = await CaseService.getSubtasks(caseId);
  if (!res.success) return rejectWithValue(res.error);
  return { caseId, subtasks: res.data };
});

export const addSubtask = createAsyncThunk(
  'cases/addSubtask',
  async ({ caseId, subtask }, { rejectWithValue }) => {
    const res = await CaseService.createSubtask(caseId, subtask);
    if (!res.success) return rejectWithValue(res.error);
    // Return whole subtask to optimistically inject (id + data)
    return {
      caseId,
      subtask: {
        id: res.subtaskId,
        ...subtask,
        status: subtask.status || 'pending',
      },
    };
  }
);

export const updateSubtask = createAsyncThunk(
  'cases/updateSubtask',
  async ({ caseId, subtaskId, patch }, { rejectWithValue }) => {
    const res = await CaseService.updateSubtask(caseId, subtaskId, patch);
    if (!res.success) return rejectWithValue(res.error);
    return { caseId, subtaskId, patch };
  }
);

export const toggleSubtaskStatus = createAsyncThunk(
  'cases/toggleSubtaskStatus',
  async ({ caseId, subtaskId, nextStatus }, { rejectWithValue }) => {
    const res = await CaseService.toggleSubtaskStatus(caseId, subtaskId, nextStatus);
    if (!res.success) return rejectWithValue(res.error);
    return { caseId, subtaskId, nextStatus };
  }
);

export const deleteSubtask = createAsyncThunk(
  'cases/deleteSubtask',
  async ({ caseId, subtaskId }, { rejectWithValue }) => {
    const res = await CaseService.deleteSubtask(caseId, subtaskId);
    if (!res.success) return rejectWithValue(res.error);
    return { caseId, subtaskId };
  }
);

// ------- Slice -------
const caseSlice = createSlice({
  name: 'cases',
  initialState: {
    cases: [],            // list
    selectedCase: null,   // single
    subtasksByCase: {},   // { [caseId]: Subtask[] }
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCase: (state) => { state.selectedCase = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // ----- cases -----
      .addCase(createCase.pending, (s) => { s.loading = true; })
      .addCase(createCase.fulfilled, (s) => { s.loading = false; })
      .addCase(createCase.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(getUserCases.pending, (s) => { s.loading = true; })
      .addCase(getUserCases.fulfilled, (s, a) => { s.loading = false; s.cases = a.payload; })
      .addCase(getUserCases.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateCaseStatus.pending, (s) => { s.loading = true; })
      .addCase(updateCaseStatus.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, status, note } = a.payload;
        const idx = s.cases.findIndex(c => c.id === caseId);
        if (idx !== -1) {
          s.cases[idx].status = status;
          s.cases[idx].timeline = [
            ...(s.cases[idx].timeline || []),
            { status, note, timestamp: new Date().toISOString() },
          ];
        }
        if (s.selectedCase?.id === caseId) {
          s.selectedCase = { ...s.selectedCase, status };
        }
      })
      .addCase(updateCaseStatus.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(addCaseDocument.pending, (s) => { s.loading = true; })
      .addCase(addCaseDocument.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, documentData } = a.payload;
        const idx = s.cases.findIndex(c => c.id === caseId);
        const docPlus = { ...documentData, uploadedAt: new Date().toISOString() };
        if (idx !== -1) {
          s.cases[idx].documents = [ ...(s.cases[idx].documents || []), docPlus ];
        }
        if (s.selectedCase?.id === caseId) {
          s.selectedCase = {
            ...s.selectedCase,
            documents: [ ...(s.selectedCase.documents || []), docPlus ],
          };
        }
      })
      .addCase(addCaseDocument.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(getCaseDetails.pending, (s) => { s.loading = true; })
      .addCase(getCaseDetails.fulfilled, (s, a) => { s.loading = false; s.selectedCase = a.payload; })
      .addCase(getCaseDetails.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // ----- subtasks -----
      .addCase(fetchSubtasks.pending, (s) => { s.loading = true; })
      .addCase(fetchSubtasks.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, subtasks } = a.payload;
        s.subtasksByCase[caseId] = subtasks;
      })
      .addCase(fetchSubtasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(addSubtask.pending, (s) => { s.loading = true; })
      .addCase(addSubtask.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, subtask } = a.payload;
        s.subtasksByCase[caseId] = [ subtask, ...(s.subtasksByCase[caseId] || []) ];
      })
      .addCase(addSubtask.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateSubtask.pending, (s) => { s.loading = true; })
      .addCase(updateSubtask.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, subtaskId, patch } = a.payload;
        const list = s.subtasksByCase[caseId] || [];
        s.subtasksByCase[caseId] = list.map(st => st.id === subtaskId ? { ...st, ...patch } : st);
      })
      .addCase(updateSubtask.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(toggleSubtaskStatus.pending, (s) => { s.loading = true; })
      .addCase(toggleSubtaskStatus.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, subtaskId, nextStatus } = a.payload;
        const list = s.subtasksByCase[caseId] || [];
        s.subtasksByCase[caseId] = list.map(st => st.id === subtaskId ? { ...st, status: nextStatus } : st);
      })
      .addCase(toggleSubtaskStatus.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(deleteSubtask.pending, (s) => { s.loading = true; })
      .addCase(deleteSubtask.fulfilled, (s, a) => {
        s.loading = false;
        const { caseId, subtaskId } = a.payload;
        const list = s.subtasksByCase[caseId] || [];
        s.subtasksByCase[caseId] = list.filter(st => st.id !== subtaskId);
      })
      .addCase(deleteSubtask.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearSelectedCase, clearError } = caseSlice.actions;

// ------- Selectors -------
export const selectCases = (state) => state.cases.cases;
export const selectSelectedCase = (state) => state.cases.selectedCase;
export const selectSubtasksByCase = (caseId) => (state) => state.cases.subtasksByCase[caseId] || [];
export const selectCaseLoading = (state) => state.cases.loading;
export const selectCaseError = (state) => state.cases.error;

export default caseSlice.reducer;
