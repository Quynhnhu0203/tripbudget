import { useEffect, useState } from 'react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('đang kiểm tra…');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('không kết nối được'));
  }, []);

  return (
    <main>
      <h1>TripBudget</h1>
      <p>Lên lịch trình du lịch theo ngân sách.</p>
      <p>API: {apiStatus}</p>
    </main>
  );
}
