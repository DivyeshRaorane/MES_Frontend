/**
 * QA Reports - Dynamic section-based reports
 * Reports assigned to QUALITY_ASSURANCE section will appear here automatically
 */
import React from 'react';
import SectionReportsList from '../../../DynamicReports/ui/SectionReportsList';

const QAReports = () => {
  return (
    <SectionReportsList
      sectionKey="QUALITY_ASSURANCE"
      title="Quality Assurance Reports"
      color="orange"
    />
  );
};

export default QAReports;
