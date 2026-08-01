/**
 * PT Reports - Now uses dynamic section-based reports
 * Reports assigned to PROOF_TESTING section will appear here automatically
 */
import React from 'react';
import SectionReportsList from '../../../DynamicReports/ui/SectionReportsList';

const PTReports = () => {
  return (
    <SectionReportsList
      sectionKey="PROOF_TESTING"
      title="Proof Testing Reports"
      color="purple"
    />
  );
};

export default PTReports;
