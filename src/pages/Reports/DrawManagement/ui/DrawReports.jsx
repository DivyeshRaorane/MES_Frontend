/**
 * Draw Reports - Now uses dynamic section-based reports
 * Reports assigned to DRAW_MANAGEMENT section will appear here automatically
 */
import React from 'react';
import SectionReportsList from '../../../DynamicReports/ui/SectionReportsList';

const DrawReports = () => {
  return (
    <SectionReportsList
      sectionKey="DRAW_MANAGEMENT"
      title="Draw Management Reports"
      color="blue"
    />
  );
};

export default DrawReports;
