/**
 * Quality Reports - Now uses dynamic section-based reports
 * Reports assigned to QUALITY section will appear here automatically
 */
import React from 'react';
import SectionReportsList from '../../../DynamicReports/ui/SectionReportsList';

const QualityReports = () => {
  return (
    <SectionReportsList
      sectionKey="QUALITY"
      title="Quality Reports"
      color="emerald"
    />
  );
};

export default QualityReports;
