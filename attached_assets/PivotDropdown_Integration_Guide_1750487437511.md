
# PivotDropdown Integration Guide

Use the steps below to drop the **PivotDropdown** component (`0965e9c7.jsx`) into your Replit logistics dashboard and wire it to the Flask pivot‑API with Redux for state.

---

## 1. Repo Layout

```text
frontend/
│
├─ components/
│   └─ PivotDropdown.jsx        # rename 0965e9c7.jsx → PivotDropdown.jsx
│
├─ redux/
│   ├─ store.js
│   └─ slices/
│       └─ pivotSlice.js
│
└─ pages/
    └─ ContractorDashboard.jsx  # or wherever the dropdown will live
```

---

## 2. Pivot API Slice (`redux/slices/pivotSlice.js`)

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPivots = createAsyncThunk(
  'pivots/fetch',
  async (filters = {}, { rejectWithValue }) => {
    const res = await axios.get('/api/pivots', { params: filters });
    return res.data;          // [{ id, title, category, status, ... }]
  }
);

const pivotSlice = createSlice({
  name: 'pivots',
  initialState: { list: [], status: 'idle', error: null, filters: {} },
  reducers: {
    setFilters(state, { payload }) { state.filters = payload; }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPivots.pending, s => { s.status = 'loading'; })
      .addCase(fetchPivots.fulfilled, (s, a) => {
        s.status = 'succeeded'; s.list = a.payload;
      })
      .addCase(fetchPivots.rejected, (s, a) => {
        s.status = 'failed'; s.error = a.error.message;
      });
  }
});

export const { setFilters } = pivotSlice.actions;
export default pivotSlice.reducer;
```

> **Remember:** Add the reducer to `store.js`.

---

## 3. Wire `PivotDropdown` to Redux

```javascript
// components/PivotDropdown.jsx  (add at top)
import { useSelector, useDispatch } from 'react-redux';
import { fetchPivots, setFilters } from '../redux/slices/pivotSlice';

export default function PivotDropdown() {
  const dispatch = useDispatch();
  const { list, status, filters } = useSelector(state => state.pivots);

  // existing hooks ...
  useEffect(() => {            // fetch when filters change
    dispatch(fetchPivots(filters));
  }, [filters, dispatch]);

  // wherever you change a filter inside the component:
  const onFilterChange = (name, value) => {
    dispatch(setFilters({ ...filters, [name]: value }));
  };

  // the rest of the JSX you already have
}
```

No logic changes—only state wiring.

---

## 4. Use `PivotDropdown` in the Dashboard

```javascript
import PivotDropdown from '../components/PivotDropdown';

export default function ContractorDashboard() {
  return (
    <section>
      <h2>Your Growth Opportunities</h2>
      <PivotDropdown />
      {/* other dashboard widgets */}
    </section>
  );
}
```

---

## 5. Flask Endpoint (`api/pivots`)

```python
@app.get("/api/pivots")
def get_pivots():
    filters = request.args.to_dict()   # category, priority, etc.
    rows = query_pivots_db(filters)    # build SQL dynamically
    return jsonify(rows), 200
```

> Ensure **CORS** is enabled (`flask_cors.CORS(app)`).

---

## 6. Styling & Accessibility (A11y)

* Optional: import a small CSS module or Tailwind classes to align with the dashboard theme.  
* Keep role attributes (`role="listbox"`, `aria-*`) already present in the component.

---

## 7. Smoke Test Checklist

1. Run Flask locally: `python app.py` → confirm `/api/pivots` returns JSON.  
2. Run React dev server (`npm run dev` or Replit **Run**).  
3. Dashboard loads with dropdown, filters work, **no console errors**.  
4. Attempt filter combos; verify **network requests & response mapping**.

---

## 8. Future Hooks

| Enhancement           | Quick Note                                                            |
|-----------------------|------------------------------------------------------------------------|
| Real-time socket push | Add WS client; dispatch `fetchPivots` on `"pivot-update"` event        |
| Voice search          | Wrap search input with simple Speech‑to‑Text and dispatch on result    |
| Unit tests            | Jest + React Testing Library: mock store, test filter interactions     |

---

## Ready for Commit 🚀

1. Move/rename the JSX file.  
2. Add the Redux slice.  
3. Confirm `.replit` runs `npm install && npm run dev` on start.

---

**PivotDropdown is now fully integrated and driven by your Flask pivot database with Redux state.**
