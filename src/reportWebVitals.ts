import {type Metric, onCLS, onFCP, onINP, onLCP, onTTFB} from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry) {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
    onINP(onPerfEntry); // INP replaced FID in web-vitals v4+
  }
};

export default reportWebVitals;
