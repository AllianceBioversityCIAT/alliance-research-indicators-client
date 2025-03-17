export class PatchResultEvidences {
  evidence: Evidence[] = [];
}

export class Evidence {
  is_active = true;
  result_evidence_id = null;
  result_id = null;
  evidence_description = '';
  evidence_url = '';
  evidence_role_id = null;
}
