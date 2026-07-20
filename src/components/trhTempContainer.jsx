// This container has been replaced by the new Temperature Entry module
// See: src/pages/temp_entry/ui/TemperatureList.jsx
// Keeping this file to prevent import errors from any remaining references
import { Navigate } from 'react-router-dom';
const TRHTempCycleContainer = () => <Navigate to="/qa/temperature" replace />;
export default TRHTempCycleContainer;
