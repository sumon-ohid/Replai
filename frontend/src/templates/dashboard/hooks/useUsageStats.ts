import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface UsageData {
  emails: {
    used: number;
    total: number | string;
    percentage: number;
  };
  accounts: {
    used: number;
    total: number | string;
    percentage: number;
  };
}

export default function useUsageStats() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData>({
    emails: {
      used: 0,
      total: 0,
      percentage: 0
    },
    accounts: {
      used: 0,
      total: 0,
      percentage: 0
    }
  });

  const fetchUsageStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            setError('No token found. Please log in again.');
            return null;
        }
      // Fetch usage statistics from the API
      const response = await axios.get<UsageData>(`${API_URL}/user/usage`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      setUsageData(response.data as UsageData);
    } catch (err) {
      console.error('Error fetching usage statistics:', err);
      setError('No usage statistics available. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return {
    usageData,
    loading,
    error,
    fetchUsageStats
  };
}