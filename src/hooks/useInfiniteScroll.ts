import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}

export function useInfiniteScroll({ fetchMore, hasMore, threshold = 100 }: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) {
      return;
    }
    setIsFetching(true);
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData();
  }, [isFetching]);

  const fetchMoreData = async () => {
    try {
      await fetchMore();
    } finally {
      setIsFetching(false);
    }
  };

  return { isFetching };
}