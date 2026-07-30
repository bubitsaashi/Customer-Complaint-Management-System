import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, fetchDashboardStats } from './store/complaintsSlice';

import Header from './components/Header';
import ComplaintIngestionView from './components/ComplaintIngestionView';
import DashboardView from './components/DashboardView';
import ComplaintListView from './components/ComplaintListView';
import ComplaintDetailView from './components/ComplaintDetailView';
import GroqKeyModal from './components/GroqKeyModal';
import IngestComplaintModal from './components/IngestComplaintModal';

export default function App() {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchComplaints());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {activeTab === 'intake' && <ComplaintIngestionView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'registry' && <ComplaintListView />}
        {activeTab === 'detail' && <ComplaintDetailView />}
      </main>

      {/* Global Modals */}
      <GroqKeyModal />
      <IngestComplaintModal />
    </div>
  );
}
