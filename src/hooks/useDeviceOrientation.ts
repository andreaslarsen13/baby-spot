import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceOrientation {
  alpha: number | null; // z-axis rotation (0-360)
  beta: number | null;  // x-axis rotation (-180 to 180)
  gamma: number | null; // y-axis rotation (-90 to 90)
}

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface UseDeviceOrientationReturn {
  orientation: DeviceOrientation | null;
  requestPermission: () => Promise<boolean>;
  permissionState: PermissionState;
  isSupported: boolean;
}

// Check support at module level (runs once)
const checkSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'DeviceOrientationEvent' in window;
};

const isDeviceOrientationSupported = checkSupport();

// Check if permission API exists (iOS 13+)
const hasPermissionAPI = (): boolean => {
  if (!isDeviceOrientationSupported) return false;
  const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  return typeof DeviceOrientationEventTyped.requestPermission === 'function';
};

const needsPermission = hasPermissionAPI();

export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);

  // Initialize permission state based on device capabilities
  const getInitialPermissionState = (): PermissionState => {
    if (!isDeviceOrientationSupported) return 'unsupported';
    if (!needsPermission) return 'granted'; // Android/older iOS - no permission needed
    return 'prompt'; // iOS 13+ - needs permission
  };

  const [permissionState, setPermissionState] = useState<PermissionState>(getInitialPermissionState);
  const listenerAddedRef = useRef(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }, []);

  const addListener = useCallback(() => {
    if (!listenerAddedRef.current && isDeviceOrientationSupported) {
      window.addEventListener('deviceorientation', handleOrientation);
      listenerAddedRef.current = true;
    }
  }, [handleOrientation]);

  const removeListener = useCallback(() => {
    if (listenerAddedRef.current) {
      window.removeEventListener('deviceorientation', handleOrientation);
      listenerAddedRef.current = false;
    }
  }, [handleOrientation]);

  // Request permission (iOS 13+ requires user interaction)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isDeviceOrientationSupported) {
      return false;
    }

    // Check if permission API exists (iOS 13+)
    const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientationEventTyped.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventTyped.requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          addListener();
          return true;
        } else {
          setPermissionState('denied');
          return false;
        }
      } catch {
        // User denied or error occurred
        setPermissionState('denied');
        return false;
      }
    } else {
      // No permission needed (Android or older iOS)
      setPermissionState('granted');
      addListener();
      return true;
    }
  }, [addListener]);

  // Auto-start listener on non-iOS devices
  useEffect(() => {
    if (!isDeviceOrientationSupported) return;

    // If no permission API needed, we can listen immediately
    if (!needsPermission) {
      addListener();
    }

    return () => {
      removeListener();
    };
  }, [addListener, removeListener]);

  return {
    orientation,
    requestPermission,
    permissionState,
    isSupported: isDeviceOrientationSupported,
  };
}
