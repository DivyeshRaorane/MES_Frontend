/**
 * FG Reports - Dynamic section-based reports
 * Reports assigned to FINISH_GOODS section will appear here automatically
 */
import React from 'react';
import SectionReportsList from '../../../DynamicReports/ui/SectionReportsList';

const FGReports = () => {
  return (
    <SectionReportsList
      sectionKey="FINISH_GOODS"
      title="Finish Goods Reports"
      color="cyan"
    />
  );
};

export default FGReports;
