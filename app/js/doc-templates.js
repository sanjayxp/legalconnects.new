// ============================================================
// LegalConnects — Document generator templates
// Pure client-side, no DB dependency. Each template defines the
// fields to collect and a render() function that returns the
// filled document as HTML (for on-screen preview + print-to-PDF).
//
// These are starting-point drafts only — every generated document
// carries a footer note reminding the advocate to review and adapt
// it before use. Not a substitute for the advocate's own judgment.
// ============================================================

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function nl(s) {
  return esc(s).replace(/\n/g, '<br>');
}
function today() {
  return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const DOC_TEMPLATES = [
  {
    key: 'legal_notice',
    title: 'Legal Notice / Demand Letter',
    blurb: 'A formal notice demanding action (payment, refund, compliance) before litigation.',
    fields: [
      { key: 'recipient_name', label: "Recipient's name", type: 'text', required: true },
      { key: 'recipient_address', label: "Recipient's address", type: 'textarea', required: true },
      { key: 'client_name', label: 'Your client\'s name (the sender)', type: 'text', required: true },
      { key: 'client_address', label: "Client's address", type: 'textarea', required: true },
      { key: 'subject', label: 'Subject line', type: 'text', placeholder: 'e.g. Legal Notice for Recovery of Security Deposit', required: true },
      { key: 'facts', label: 'Facts of the matter', type: 'textarea', required: true },
      { key: 'demand', label: 'What you are demanding', type: 'textarea', required: true },
      { key: 'notice_days', label: 'Days given to comply', type: 'number', placeholder: '15' },
      { key: 'advocate_name', label: 'Advocate name', type: 'text', required: true },
      { key: 'enrollment_no', label: 'Bar Council enrolment number', type: 'text' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:right">${today()}</p>
        <p><b>To,</b><br>${nl(f.recipient_name)}<br>${nl(f.recipient_address)}</p>
        <p><b>Subject: ${esc(f.subject)}</b></p>
        <p>Sir/Madam,</p>
        <p>Under instructions from and on behalf of my client, <b>${esc(f.client_name)}</b>, residing/registered at ${esc(f.client_address)}, I serve upon you the following legal notice:</p>
        <p><b>1. Facts:</b><br>${nl(f.facts)}</p>
        <p><b>2. Demand:</b><br>${nl(f.demand)}</p>
        <p>You are hereby called upon to comply with the above within <b>${esc(f.notice_days || '15')} days</b> of receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you, entirely at your risk, cost, and consequences.</p>
        <p>A copy of this notice has been retained in my office for record and further action.</p>
        <p style="margin-top:32px">Yours faithfully,</p>
        <p style="margin-top:48px"><b>${esc(f.advocate_name)}</b><br>${f.enrollment_no ? 'Enrolment No: ' + esc(f.enrollment_no) + '<br>' : ''}Advocate${f.place ? ', ' + esc(f.place) : ''}</p>
      `;
    },
  },
  {
    key: 'vakalatnama',
    title: 'Vakalatnama',
    blurb: 'Authorizes an advocate to appear and act on behalf of a client in a specific case.',
    fields: [
      { key: 'court_name', label: 'Court name', type: 'text', required: true },
      { key: 'case_title', label: 'Case title (Petitioner vs Respondent)', type: 'text', required: true },
      { key: 'case_number', label: 'Case / CNR number (if allotted)', type: 'text' },
      { key: 'client_name', label: 'Client name', type: 'text', required: true },
      { key: 'client_address', label: 'Client address', type: 'textarea', required: true },
      { key: 'client_role', label: "Client's role in the case", type: 'text', placeholder: 'e.g. Plaintiff / Defendant / Petitioner' },
      { key: 'advocate_name', label: 'Advocate name', type: 'text', required: true },
      { key: 'enrollment_no', label: 'Bar Council enrolment number', type: 'text' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:center"><b>IN THE ${esc((f.court_name || '').toUpperCase())}</b></p>
        <p style="text-align:center">${f.case_number ? 'Case/CNR No. ' + esc(f.case_number) + '<br>' : ''}${esc(f.case_title)}</p>
        <p style="text-align:center"><b>VAKALATNAMA</b></p>
        <p>I, <b>${esc(f.client_name)}</b>, ${esc(f.client_role || 'party')} in the above matter, residing at ${esc(f.client_address)}, do hereby appoint and retain <b>${esc(f.advocate_name)}</b>${f.enrollment_no ? ' (Enrolment No. ' + esc(f.enrollment_no) + ')' : ''}, Advocate, to appear, act, and plead on my behalf in the above-noted case, and in all proceedings, applications, appeals, and execution arising therefrom.</p>
        <p>I authorise the said Advocate to sign, verify, present, and withdraw pleadings, applications, and documents; to receive notices; to compromise, withdraw, or refer the matter to arbitration; to deposit, draw, and receive money and documents on my behalf; and to do all acts necessary for the effective conduct of the case.</p>
        <p>The said Advocate is at liberty to engage or associate other counsel at my cost.</p>
        <p style="margin-top:32px">${esc(f.place || '')}<br>${today()}</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>Signature of Client</b><br>${esc(f.client_name)}</td>
          <td style="width:50%"><b>Accepted:</b><br>${esc(f.advocate_name)}<br>Advocate</td>
        </tr></table>
      `;
    },
  },
  {
    key: 'engagement_letter',
    title: 'Engagement / Retainer Letter',
    blurb: "Sets out scope, fees, and terms when taking on a new client's matter.",
    fields: [
      { key: 'advocate_name', label: 'Advocate / chamber name', type: 'text', required: true },
      { key: 'client_name', label: 'Client name', type: 'text', required: true },
      { key: 'client_address', label: 'Client address', type: 'textarea' },
      { key: 'matter', label: 'Matter description', type: 'textarea', required: true },
      { key: 'scope', label: 'Scope of work', type: 'textarea', required: true },
      { key: 'fee_structure', label: 'Fee structure', type: 'textarea', placeholder: 'e.g. ₹1,500 per consultation; ₹25,000 retainer for the matter; ₹5,000 per hearing appearance' },
      { key: 'retainer_amount', label: 'Retainer amount payable upfront (₹)', type: 'text' },
      { key: 'payment_terms', label: 'Payment terms', type: 'textarea', placeholder: 'e.g. Invoiced monthly, payable within 7 days' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:right">${today()}</p>
        <p><b>To,</b><br>${nl(f.client_name)}<br>${nl(f.client_address)}</p>
        <p><b>Subject: Letter of Engagement</b></p>
        <p>Dear ${esc(f.client_name)},</p>
        <p>Thank you for choosing <b>${esc(f.advocate_name)}</b> to represent you in the following matter:</p>
        <p><b>Matter:</b><br>${nl(f.matter)}</p>
        <p><b>Scope of work:</b><br>${nl(f.scope)}</p>
        <p><b>Fees:</b><br>${nl(f.fee_structure || 'To be mutually agreed for each stage of the matter.')}</p>
        ${f.retainer_amount ? `<p>A retainer of <b>₹${esc(f.retainer_amount)}</b> is payable upon acceptance of this engagement, to be adjusted against final fees.</p>` : ''}
        <p><b>Payment terms:</b><br>${nl(f.payment_terms || 'As invoiced.')}</p>
        <p>This engagement covers only the scope described above; any additional work will be billed separately after prior discussion. Either party may terminate this engagement with written notice, subject to fees due for work already performed.</p>
        <p>Please countersign a copy of this letter to confirm your acceptance of these terms.</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>${esc(f.advocate_name)}</b>${f.place ? '<br>' + esc(f.place) : ''}</td>
          <td style="width:50%"><b>Accepted by:</b><br>${esc(f.client_name)}</td>
        </tr></table>
      `;
    },
  },
  {
    key: 'affidavit',
    title: 'Affidavit (General)',
    blurb: 'A sworn written statement of facts, customizable for most general purposes.',
    fields: [
      { key: 'deponent_name', label: 'Deponent name', type: 'text', required: true },
      { key: 'parent_name', label: "Son/Daughter/Wife of", type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'address', label: 'Address', type: 'textarea', required: true },
      { key: 'statements', label: 'Statements (one point per line)', type: 'textarea', required: true, placeholder: 'That I am the deponent herein...\nThat...\nThat...' },
      { key: 'place', label: 'Place of signing', type: 'text' },
    ],
    render(f) {
      const points = (f.statements || '').split('\n').filter(l => l.trim());
      return `
        <p style="text-align:center"><b>AFFIDAVIT</b></p>
        <p>I, <b>${esc(f.deponent_name)}</b>, ${f.parent_name ? 'S/o, D/o, W/o ' + esc(f.parent_name) + ', ' : ''}${f.age ? 'aged ' + esc(f.age) + ' years, ' : ''}residing at ${esc(f.address)}, do hereby solemnly affirm and declare as under:</p>
        <ol style="padding-left:20px">
          ${points.map(p => `<li style="margin-bottom:8px">${esc(p.replace(/^that\s*/i, '').trim())}</li>`).join('')}
        </ol>
        <p>I state that the contents of the above affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.</p>
        <p style="margin-top:32px">Verified at ${esc(f.place || '')} on this ${today()}.</p>
        <p style="margin-top:48px"><b>DEPONENT</b><br>${esc(f.deponent_name)}</p>
      `;
    },
  },
  {
    key: 'general_poa',
    title: 'General Power of Attorney',
    blurb: 'Authorizes an agent to act on the principal\'s behalf for specified matters.',
    fields: [
      { key: 'principal_name', label: 'Principal (person granting authority)', type: 'text', required: true },
      { key: 'principal_address', label: "Principal's address", type: 'textarea', required: true },
      { key: 'agent_name', label: 'Agent / Attorney-holder', type: 'text', required: true },
      { key: 'agent_address', label: "Agent's address", type: 'textarea', required: true },
      { key: 'powers', label: 'Powers being granted (one per line)', type: 'textarea', required: true },
      { key: 'place', label: 'Place', type: 'text' },
      { key: 'witness1', label: 'Witness 1 name', type: 'text' },
      { key: 'witness2', label: 'Witness 2 name', type: 'text' },
    ],
    render(f) {
      const powers = (f.powers || '').split('\n').filter(l => l.trim());
      return `
        <p style="text-align:center"><b>GENERAL POWER OF ATTORNEY</b></p>
        <p>I, <b>${esc(f.principal_name)}</b>, residing at ${esc(f.principal_address)}, do hereby nominate, constitute, and appoint <b>${esc(f.agent_name)}</b>, residing at ${esc(f.agent_address)}, as my true and lawful attorney, to do the following acts, deeds, and things on my behalf:</p>
        <ol style="padding-left:20px">
          ${powers.map(p => `<li style="margin-bottom:8px">${esc(p.trim())}</li>`).join('')}
        </ol>
        <p>I hereby agree to ratify and confirm all acts lawfully done by my said attorney under this Power of Attorney.</p>
        <p style="margin-top:32px">${esc(f.place || '')}<br>${today()}</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>Principal</b><br>${esc(f.principal_name)}</td>
          <td style="width:50%"><b>Witnesses:</b><br>1. ${esc(f.witness1 || '')}<br>2. ${esc(f.witness2 || '')}</td>
        </tr></table>
      `;
    },
  },
  {
    key: 'rent_agreement',
    title: 'Rent / Lease Agreement',
    blurb: 'Basic residential or commercial tenancy agreement between landlord and tenant.',
    fields: [
      { key: 'landlord_name', label: 'Landlord name', type: 'text', required: true },
      { key: 'landlord_address', label: "Landlord's address", type: 'textarea' },
      { key: 'tenant_name', label: 'Tenant name', type: 'text', required: true },
      { key: 'tenant_address', label: "Tenant's permanent address", type: 'textarea' },
      { key: 'property_address', label: 'Rented property address', type: 'textarea', required: true },
      { key: 'monthly_rent', label: 'Monthly rent (₹)', type: 'text', required: true },
      { key: 'deposit', label: 'Security deposit (₹)', type: 'text' },
      { key: 'start_date', label: 'Lease start date', type: 'date' },
      { key: 'duration_months', label: 'Duration (months)', type: 'number', placeholder: '11' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:center"><b>LEASE AGREEMENT</b></p>
        <p>This Lease Agreement is made on ${today()} at ${esc(f.place || '')} between:</p>
        <p><b>${esc(f.landlord_name)}</b>, ${esc(f.landlord_address || '')} (hereinafter "the Landlord"), and</p>
        <p><b>${esc(f.tenant_name)}</b>, ${esc(f.tenant_address || '')} (hereinafter "the Tenant").</p>
        <p><b>1. Premises:</b> The Landlord agrees to let out the premises situated at ${esc(f.property_address)} to the Tenant.</p>
        <p><b>2. Rent:</b> The Tenant shall pay a monthly rent of <b>₹${esc(f.monthly_rent)}</b>, payable in advance by the 5th of each month.</p>
        ${f.deposit ? `<p><b>3. Security Deposit:</b> The Tenant has paid a refundable interest-free security deposit of <b>₹${esc(f.deposit)}</b>, refundable at the end of the tenancy after deducting dues, if any.</p>` : ''}
        <p><b>4. Term:</b> This lease is for a period of <b>${esc(f.duration_months || '11')} months</b>${f.start_date ? ' commencing from ' + esc(f.start_date) : ''}, renewable by mutual consent.</p>
        <p><b>5. Use:</b> The Tenant shall use the premises for lawful residential/commercial purposes only and shall not sublet without the Landlord's written consent.</p>
        <p><b>6. Maintenance:</b> The Tenant shall maintain the premises in good condition, normal wear and tear excepted, and shall bear utility charges.</p>
        <p><b>7. Termination:</b> Either party may terminate this agreement by giving one month's written notice.</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>Landlord</b><br>${esc(f.landlord_name)}</td>
          <td style="width:50%"><b>Tenant</b><br>${esc(f.tenant_name)}</td>
        </tr></table>
      `;
    },
  },
  {
    key: 'partnership_deed',
    title: 'Partnership Deed (Basic)',
    blurb: 'Foundational deed for a two-partner firm — capital, profit share, and roles.',
    fields: [
      { key: 'firm_name', label: 'Firm name', type: 'text', required: true },
      { key: 'firm_address', label: "Firm's principal place of business", type: 'textarea', required: true },
      { key: 'business_nature', label: 'Nature of business', type: 'text', required: true },
      { key: 'partner1_name', label: 'Partner 1 — name', type: 'text', required: true },
      { key: 'partner1_address', label: 'Partner 1 — address', type: 'textarea' },
      { key: 'partner1_capital', label: 'Partner 1 — capital contribution (₹)', type: 'text' },
      { key: 'partner2_name', label: 'Partner 2 — name', type: 'text', required: true },
      { key: 'partner2_address', label: 'Partner 2 — address', type: 'textarea' },
      { key: 'partner2_capital', label: 'Partner 2 — capital contribution (₹)', type: 'text' },
      { key: 'profit_ratio', label: 'Profit/loss sharing ratio', type: 'text', placeholder: 'e.g. 50:50' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:center"><b>DEED OF PARTNERSHIP</b></p>
        <p>This Deed of Partnership is made on ${today()} at ${esc(f.place || '')} between <b>${esc(f.partner1_name)}</b> and <b>${esc(f.partner2_name)}</b> (hereinafter "the Partners"), who have agreed to carry on business in partnership on the following terms:</p>
        <p><b>1. Name and place of business:</b> The partnership shall carry on business under the name <b>"${esc(f.firm_name)}"</b> at ${esc(f.firm_address)}.</p>
        <p><b>2. Nature of business:</b> ${esc(f.business_nature)}.</p>
        <p><b>3. Capital:</b> ${esc(f.partner1_name)} shall contribute ₹${esc(f.partner1_capital || '—')} and ${esc(f.partner2_name)} shall contribute ₹${esc(f.partner2_capital || '—')} as initial capital.</p>
        <p><b>4. Profit and loss sharing:</b> Profits and losses shall be shared in the ratio of <b>${esc(f.profit_ratio || '50:50')}</b>.</p>
        <p><b>5. Duration:</b> The partnership shall commence from the date hereof and shall continue until dissolved by mutual consent or as per law.</p>
        <p><b>6. Bank account and signing authority:</b> The partnership shall operate a bank account to be jointly or severally operated as the Partners may decide from time to time.</p>
        <p><b>7. Dispute resolution:</b> Any dispute between the Partners shall first be resolved amicably, failing which by arbitration under the Arbitration and Conciliation Act, 1996.</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>Partner 1</b><br>${esc(f.partner1_name)}<br>${esc(f.partner1_address || '')}</td>
          <td style="width:50%"><b>Partner 2</b><br>${esc(f.partner2_name)}<br>${esc(f.partner2_address || '')}</td>
        </tr></table>
      `;
    },
  },
  {
    key: 'nda',
    title: 'Non-Disclosure Agreement (NDA)',
    blurb: 'Protects confidential information shared between two parties.',
    fields: [
      { key: 'disclosing_party', label: 'Disclosing party', type: 'text', required: true },
      { key: 'receiving_party', label: 'Receiving party', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose of sharing information', type: 'textarea', required: true, placeholder: 'e.g. evaluating a potential business collaboration' },
      { key: 'duration_years', label: 'Confidentiality period (years)', type: 'number', placeholder: '3' },
      { key: 'governing_state', label: 'Governing law (state)', type: 'text', placeholder: 'e.g. Maharashtra' },
      { key: 'place', label: 'Place', type: 'text' },
    ],
    render(f) {
      return `
        <p style="text-align:center"><b>NON-DISCLOSURE AGREEMENT</b></p>
        <p>This Non-Disclosure Agreement is made on ${today()} at ${esc(f.place || '')} between <b>${esc(f.disclosing_party)}</b> ("Disclosing Party") and <b>${esc(f.receiving_party)}</b> ("Receiving Party").</p>
        <p><b>1. Purpose:</b> The parties wish to explore ${esc(f.purpose)}, in the course of which the Disclosing Party may share confidential information with the Receiving Party.</p>
        <p><b>2. Confidentiality obligation:</b> The Receiving Party agrees to hold all such information in strict confidence, to use it solely for the stated purpose, and not to disclose it to any third party without prior written consent.</p>
        <p><b>3. Exclusions:</b> This obligation does not extend to information that is already public, independently developed, or required to be disclosed by law.</p>
        <p><b>4. Term:</b> This obligation shall survive for <b>${esc(f.duration_years || '3')} years</b> from the date of this Agreement.</p>
        <p><b>5. Governing law:</b> This Agreement shall be governed by the laws of ${esc(f.governing_state || 'India')}, and courts at the above place shall have exclusive jurisdiction.</p>
        <table style="width:100%;margin-top:32px"><tr>
          <td style="width:50%"><b>Disclosing Party</b><br>${esc(f.disclosing_party)}</td>
          <td style="width:50%"><b>Receiving Party</b><br>${esc(f.receiving_party)}</td>
        </tr></table>
      `;
    },
  },
];

export function getTemplate(key) {
  return DOC_TEMPLATES.find(t => t.key === key);
}
