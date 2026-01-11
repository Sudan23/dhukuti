import { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Custom hook to fetch and manage circles data
 * @returns {Object} { circles, loading, error, refetch }
 */
export function useCircles() {
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCircles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/circles');
            setCircles(response.data || []);
        } catch (err) {
            setError(err);
            console.error('Failed to fetch circles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadCircles = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/circles');
                if (!cancelled) {
                    setCircles(response.data || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err);
                    console.error('Failed to fetch circles:', err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCircles();

        return () => {
            cancelled = true;
        };
    }, []);

    return { circles, loading, error, refetch: fetchCircles };
}

/**
 * Custom hook to fetch and manage circle details
 * @param {string|number} circleId - The circle ID
 * @returns {Object} { circle, loading, error, refetch }
 */
export function useCircleDetails(circleId) {
    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCircleDetails = async () => {
        if (!circleId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/circles/${circleId}`);
            setCircle(response.data);
        } catch (err) {
            setError(err);
            console.error('Failed to fetch circle details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadCircleDetails = async () => {
            if (!circleId) return;

            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/circles/${circleId}`);
                if (!cancelled) {
                    setCircle(response.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err);
                    console.error('Failed to fetch circle details:', err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCircleDetails();

        return () => {
            cancelled = true;
        };
    }, [circleId]);

    return { circle, loading, error, refetch: fetchCircleDetails };
}
