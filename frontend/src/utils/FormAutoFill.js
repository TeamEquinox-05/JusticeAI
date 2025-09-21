// Utility to auto-fill forms based on server analysis data
export class FormAutoFill {
  static parseServerResponse(serverResponse) {
    try {
      // The server response comes in the format described
      const data = typeof serverResponse === 'string' ? JSON.parse(serverResponse) : serverResponse;
      
      // Extract form details and other data
      return {
        formDetails: data.form_details || {},
        courtName: data.court_name || '',
        caseIdentification: data.case_identification || {},
        reportSummary: data.report_summary || {},
        complainantDetails: data.complainant_details || {},
        seizedProperties: data.seized_properties_relied_upon || [],
        accusedChargeSheet: data.accused_charge_sheeted || [],
        investigationFindings: data.investigation_findings || {},
        submissionDetails: data.submission_details || {}
      };
    } catch (error) {
      console.error('Error parsing server response:', error);
      return null;
    }
  }

  static populateChargeSheetForm(analysisData) {
    if (!analysisData) return {};

    return {
      form_details: analysisData.formDetails || {
        form_name: "FORM IF5",
        document_title: "FINAL FORM/REPORT (Under Section 173 CR. P.C.)"
      },
      court_name: analysisData.courtName || "",
      case_identification: {
        district: analysisData.caseIdentification?.district || "",
        police_station: analysisData.caseIdentification?.police_station || "",
        year: analysisData.caseIdentification?.year || "",
        fir_no: analysisData.caseIdentification?.fir_no || "",
        fir_date: analysisData.caseIdentification?.fir_date || "",
        final_report_or_chargesheet_no: analysisData.caseIdentification?.final_report_or_chargesheet_no || "",
        final_report_date: analysisData.caseIdentification?.final_report_date || "",
        acts_and_sections: analysisData.caseIdentification?.acts_and_sections || [
          { act: "", section: "" },
          { act: "", section: "" },
          { act: "", section: "" }
        ],
        other_acts_and_sections: analysisData.caseIdentification?.other_acts_and_sections || "",
        report_type: analysisData.caseIdentification?.report_type || ""
      },
      report_summary: {
        type_of_final_report: analysisData.reportSummary?.type_of_final_report || "",
        reason_if_unoccurred: analysisData.reportSummary?.reason_if_unoccurred || "",
        investigating_officer_name: analysisData.reportSummary?.investigating_officer_name || "",
        investigating_officer_rank: analysisData.reportSummary?.investigating_officer_rank || ""
      },
      complainant_details: {
        name: analysisData.complainantDetails?.name || "",
        father_or_husband_name: analysisData.complainantDetails?.father_or_husband_name || ""
      },
      seized_properties_relied_upon: analysisData.seizedProperties || [],
      accused_charge_sheeted: analysisData.accusedChargeSheet || [],
      investigation_findings: {
        action_if_fr_is_false: analysisData.investigationFindings?.action_if_fr_is_false || "",
        result_of_laboratory_analysis: analysisData.investigationFindings?.result_of_laboratory_analysis || "",
        brief_facts_of_case: analysisData.investigationFindings?.brief_facts_of_case || ""
      },
      submission_details: {
        is_refer_notice_served: analysisData.submissionDetails?.is_refer_notice_served || "",
        refer_notice_date: analysisData.submissionDetails?.refer_notice_date || "",
        despatched_on_date: analysisData.submissionDetails?.despatched_on_date || "",
        forwarding_officer: analysisData.submissionDetails?.forwarding_officer || {},
        submitting_investigating_officer: analysisData.submissionDetails?.submitting_investigating_officer || {}
      }
    };
  }

  static populateFIRForm(analysisData, originalCaseData) {
    if (!analysisData) return {};

    return {
      form_details: {
        form_name: "FORM-IF1 - (Integrated Form)",
        report_title: "FIRST INFORMATION REPORT",
        legal_provision: "(Under Section 154 Cr.P.C)"
      },
      fir_registration: {
        district: analysisData.caseIdentification?.district || "",
        police_station: analysisData.caseIdentification?.police_station || "",
        fir_no: analysisData.caseIdentification?.fir_no || "",
        date: analysisData.caseIdentification?.fir_date || ""
      },
      offense_details: {
        acts_and_sections: analysisData.caseIdentification?.acts_and_sections || [
          { act: "", sections: "" },
          { act: "", sections: "" },
          { act: "", sections: "" }
        ],
        other_acts_sections: analysisData.caseIdentification?.other_acts_and_sections || ""
      },
      timeline_of_events: {
        occurrence_of_offence: {
          day: originalCaseData?.incidentDate ? new Date(originalCaseData.incidentDate).toLocaleDateString('en-US', { weekday: 'long' }) : "",
          date: originalCaseData?.incidentDate || "",
          time: originalCaseData?.incidentTime || ""
        },
        information_received_at_ps: {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].slice(0, 5)
        },
        general_diary_reference: {
          entry_nos: "",
          time: ""
        }
      },
      information_type: "Written",
      place_of_occurrence: {
        direction_and_distance_from_ps: "",
        beat_no: "",
        address: originalCaseData?.victimLocation || "",
        if_outside_limit: {
          police_station: "",
          district: ""
        }
      },
      complainant_informant_details: {
        name: analysisData.complainantDetails?.name || "Complainant Name",
        father_or_husband_name: analysisData.complainantDetails?.father_or_husband_name || "",
        address: originalCaseData?.victimLocation || "",
        contact_number: "",
        age: originalCaseData?.victimAge || "",
        gender: originalCaseData?.victimGender || ""
      }
    };
  }

  static populateVictimStatementForm(analysisData, originalCaseData) {
    if (!analysisData) return {};

    return {
      document_title: "Victim's Statement Record",
      case_reference: {
        fir_no: analysisData.caseIdentification?.fir_no || "",
        date: analysisData.caseIdentification?.fir_date || "",
        police_station: analysisData.caseIdentification?.police_station || "",
        district: analysisData.caseIdentification?.district || ""
      },
      victim_details: {
        name: analysisData.complainantDetails?.name || "Victim Name",
        age: originalCaseData?.victimAge || "",
        gender: originalCaseData?.victimGender || "",
        father_or_husband_name: analysisData.complainantDetails?.father_or_husband_name || "",
        address: originalCaseData?.victimLocation || "",
        contact_number: ""
      },
      accused_details: analysisData.accusedChargeSheet?.map(accused => ({
        name: accused.name || "",
        alias: "",
        address: accused.address || "",
        physical_description: "",
        relationship_to_victim: ""
      })) || [
        {
          name: "",
          alias: "",
          address: "",
          physical_description: "",
          relationship_to_victim: ""
        }
      ],
      statement_meta_data: {
        date_of_recording: new Date().toISOString().split('T')[0],
        time_of_recording: new Date().toTimeString().split(' ')[0].slice(0, 5),
        place_of_recording: "",
        recording_officer_name: "",
        recording_officer_rank: ""
      },
      statement_content: {
        chronological_narrative: originalCaseData?.caseDescription || ""
      },
      compliance_checklist: {
        was_statement_recorded_by_woman_officer: "",
        was_guardian_present_for_minor_victim: "",
        was_statement_recorded_at_victim_residence_or_choice_location: ""
      }
    };
  }

  static getRecommendedForms(analysisData) {
    const recommendedForms = [];
    
    // Always recommend these basic forms
    recommendedForms.push({
      name: 'FIR Form',
      component: 'FIRForm',
      description: 'First Information Report - Required for case registration',
      priority: 'high'
    });

    // Add charge sheet if analysis indicates it's needed
    if (analysisData?.reportSummary?.type_of_final_report === 'Chargesheet') {
      recommendedForms.push({
        name: 'Charge Sheet',
        component: 'ChargeSheetForm',
        description: 'Final charge sheet based on investigation',
        priority: 'high'
      });
    }

    // Add victim statement form
    recommendedForms.push({
      name: 'Victim Statement',
      component: 'VictimStatementForm',
      description: 'Detailed victim statement record',
      priority: 'medium'
    });

    // Add other forms based on case type and requirements
    if (analysisData?.accusedChargeSheet?.some(accused => accused.date_of_arrest)) {
      recommendedForms.push({
        name: 'Arrest Memo',
        component: 'ArrestMemoForm',
        description: 'Arrest documentation',
        priority: 'medium'
      });
    }

    return recommendedForms;
  }
}

export default FormAutoFill;