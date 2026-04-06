# AI Contract Generator — Prompt Library

## Contract Types
1. Master Service Agreement (MSA)
2. Statement of Work (SOW)
3. Non-Disclosure Agreement (NDA)
4. Independent Contractor Agreement
5. Consulting Agreement

---

## SYSTEM PROMPT (for all contracts)

You are a legal document specialist creating professional contracts for freelancers and consultants. Your contracts must be:
- Legally sound and enforceable
- Written in clear, plain language (both parties understand)
- Protective of the service provider's interests
- Professional but not intimidating to clients

Never include: wandering generalities, filler content, or redundant clauses.
Always include: specific dates, amounts, deliverables, and clear termination terms.

---

## 1. MASTER SERVICE AGREEMENT (MSA)

### User Inputs Required:
- PROVIDER_NAME: Your business name or legal name
- CLIENT_NAME: Client's business name or legal name
- EFFECTIVE_DATE: Contract start date
- SERVICES_DESCRIPTION: Brief summary of services offered
- PAYMENT_TERMS: e.g., "Net 30", "50% upfront, 50% on completion"
- RATE_STRUCTURE: e.g., "$150/hour", "$5,000/month", "As per SOW"
- JURISDICTION: State/country governing law
- TERMINATION_NOTICE: Days notice required (usually 14-30)

### MSA TEMPLATE

```
MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into as of [EFFECTIVE_DATE] by and between:

PROVIDER: [PROVIDER_NAME] ("Service Provider")
CLIENT: [CLIENT_NAME] ("Client")

1. SCOPE OF SERVICES
Service Provider agrees to provide the services described in one or more Statements of Work ("SOW") that may be executed under this Agreement. Each SOW will reference this Agreement and describe specific deliverables, timelines, and fees.

2. COMPENSATION
2.1 Client agrees to pay Service Provider according to the rate structure outlined in each SOW: [RATE_STRUCTURE]
2.2 Payment terms: [PAYMENT_TERNS]
2.3 Late payments will incur a fee of 1.5% per month on overdue balances.

3. RELATIONSHIP
3.1 Service Provider is an independent contractor, not an employee, partner, or agent of Client.
3.2 Service Provider is responsible for all taxes, insurance, and benefits related to their business.

4. INTELLECTUAL PROPERTY
4.1 All work product created specifically for Client becomes Client's property upon full payment.
4.2 Service Provider retains ownership of pre-existing intellectual property, templates, and methodologies.
4.3 Service Provider may display completed work in their portfolio (confidential details will be redacted).

5. CONFIDENTIALITY
5.1 Both parties agree to protect confidential information shared during the engagement.
5.2 Confidential information may only be used for purposes of this Agreement.
5.3 Confidentiality obligations survive termination of this Agreement.

6. LIMITATION OF LIABILITY
6.1 Service Provider's total liability is limited to the fees paid under the applicable SOW.
6.2 Service Provider is not liable for indirect, incidental, or consequential damages.

7. TERMINATION
7.1 Either party may terminate this Agreement with [TERMINATION_NOTICE] days written notice.
7.2 Client will pay for all work completed prior to termination.
7.3 Either party may terminate immediately for material breach if uncured after 10 days notice.

8. DISPUTE RESOLUTION
8.1 Disputes will first be addressed through good-faith negotiation.
8.2 If unresolved, disputes will be governed by the laws of [JURISDICTION].
8.3 Any legal proceedings will take place in [JURISDICTION] courts.

9. ENTIRE AGREEMENT
This Agreement, together with any executed SOWs, constitutes the entire agreement between the parties.

[SIGNATURE LINES]
```

---

## 2. STATEMENT OF WORK (SOW)

### User Inputs Required:
- PROJECT_NAME: Name of this specific project
- MSA_DATE: Date of the underlying Master Service Agreement
- CLIENT_NAME: Client's name
- PROVIDER_NAME: Your name/business
- PROJECT_OVERVIEW: High-level description of the project
- DELIVERABLES: Specific items to be delivered (bullet list)
- TIMELINE: Project schedule with milestones
- TOTAL_PROJECT_COST: Fixed price or estimate
- PAYMENT_SCHEDULE: When payments are due (e.g., milestones)
- REVISION_LIMIT: Number of revision rounds included

### SOW TEMPLATE

```
STATEMENT OF WORK

Project Name: [PROJECT_NAME]
Reference Agreement: Master Service Agreement dated [MSA_DATE]

PARTIES:
Provider: [PROVIDER_NAME]
Client: [CLIENT_NAME]

1. PROJECT OVERVIEW
[PROJECT_OVERVIEW]

2. SCOPE OF WORK
[SPECIFIC DELIVERABLES AND REQUIREMENTS]

3. DELIVERABLES
The following deliverables will be provided:
- [DELIVERABLE 1]
- [DELIVERABLE 2]
- [DELIVERABLE 3]

4. TIMELINE
[PROJECT TIMELINE WITH MILESTONES]

5. COMPENSATION
5.1 Total Project Cost: [TOTAL_PROJECT_COST]
5.2 Payment Schedule:
[PAYMENT SCHEDULE - e.g.:
- 50% upon SOW execution
- 25% upon milestone 2 completion
- 25% upon final delivery]

6. REVISIONS
This SOW includes [REVISION_LIMIT] rounds of revisions. Additional revisions will be billed at the standard rate.

7. EXCLUSIONS
The following are explicitly excluded from this SOW:
- [ITEM 1]
- [ITEM 2]

[SIGNATURE LINES]
```

---

## 3. NON-DISCLOSURE AGREEMENT (NDA) — MUTUAL

### User Inputs Required:
- PARTY_A_NAME: Your name/business
- PARTY_B_NAME: Client's name/business
- EFFECTIVE_DATE: Start date
- PURPOSE: Why information is being shared
- DURATION: How long confidentiality lasts (usually 2-5 years)
- JURISDICTION: Governing law

### NDA TEMPLATE

```
MUTUAL NON-DISCLOSURE AGREEMENT

Effective Date: [EFFECTIVE_DATE]

PARTIES:
Party A: [PARTY_A_NAME]
Party B: [PARTY_B_NAME]

1. PURPOSE
The parties wish to explore a potential business relationship regarding [PURPOSE]. In connection with this, each party may share confidential information.

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information disclosed by either party, including but not limited to:
- Business plans, strategies, and financial information
- Customer lists and supplier information
- Technical data, software, and processes
- Pricing and marketing strategies

3. OBLIGATIONS
3.1 Each party will protect the other's Confidential Information with reasonable care.
3.2 Confidential Information may only be used for the Purpose stated above.
3.3 Each party may share Confidential Information with employees who need to know for the Purpose.

4. EXCLUSIONS
Confidential Information does not include information that:
- Is or becomes publicly available without breach
- Was known prior to disclosure
- Is independently developed without using Confidential Information
- Is rightfully obtained from a third party

5. TERM
This Agreement expires [DURATION] from the Effective Date.
Obligations regarding trade secrets survive indefinitely.

6. RETURN OF INFORMATION
Upon request, each party will return or destroy all Confidential Information.

7. NO LICENSE
This Agreement does not grant any license or rights to intellectual property.

8. GOVERNING LAW
This Agreement is governed by the laws of [JURISDICTION].

[SIGNATURE LINES]
```

---

## 4. INDEPENDENT CONTRACTOR AGREEMENT

### User Inputs Required:
- CONTRACTOR_NAME: Your name/business
- CLIENT_NAME: Client's name/business
- EFFECTIVE_DATE: Start date
- SERVICES_DESCRIPTION: What you're doing
- COMPENSATION: How much and when
- EQUIPMENT_WHO_PROVIDES: Who supplies tools/equipment
- WORK_LOCATION: Where work happens
- HOURS_EXPECTED: Expected time commitment
- TERMINATION_NOTICE: Days notice required
- JURISDICTION: Governing law

### CONTRACTOR AGREEMENT TEMPLATE

```
INDEPENDENT CONTRACTOR AGREEMENT

Date: [EFFECTIVE_DATE]

CONTRACTOR: [CONTRACTOR_NAME] ("Contractor")
CLIENT: [CLIENT_NAME] ("Client")

1. SERVICES
Contractor will provide the following services: [SERVICES_DESCRIPTION]

2. COMPENSATION
2.1 Client will pay Contractor: [COMPENSATION]
2.2 Payment is due within [PAYMENT_TERMS] of invoice submission.

3. INDEPENDENT CONTRACTOR STATUS
3.1 Contractor is an independent contractor, not an employee.
3.2 Contractor controls the means and methods of performing the work.
3.3 Contractor is responsible for all taxes and insurance.
3.4 Contractor may work for other clients during this engagement.

4. WORK LOCATION AND HOURS
4.1 Work will be performed at: [WORK_LOCATION]
4.2 Contractor will work approximately [HOURS_EXPECTED] hours per week/month.
4.3 Contractor sets their own schedule.

5. EQUIPMENT AND EXPENSES
[EQUIPMENT_WHO_PROVIDES] will provide necessary equipment and tools.
Contractor will be reimbursed for pre-approved expenses.

6. CONFIDENTIALITY
Contractor will not disclose Client's confidential information.

7. INTELLECTUAL PROPERTY
7.1 Work product created for Client belongs to Client upon payment.
7.2 Contractor retains rights to pre-existing materials and methodologies.

8. TERMINATION
Either party may terminate with [TERMINATION_NOTICE] days written notice.
Client pays for all work completed to date.

9. LIMITATION OF LIABILITY
Contractor's liability is limited to fees paid under this Agreement.

10. GOVERNING LAW
This Agreement is governed by [JURISDICTION] law.

[SIGNATURE LINES]
```

---

## 5. CONSULTING AGREEMENT (RETAINER/HOURLY)

### User Inputs Required:
- CONSULTANT_NAME: Your name/business
- CLIENT_NAME: Client's name/business
- EFFECTIVE_DATE: Start date
- CONSULTING_SCOPE: Areas of expertise/advice
- ENGAGEMENT_TYPE: "Retainer" or "Hourly"
- RETAINER_AMOUNT: Monthly fee if retainer
- HOUR_RATE: Hourly rate if hourly
- HOURS_PER_MONTH: Included hours (for retainer)
- PAYMENT_DUE: When payment is due (e.g., "1st of each month")
- TERM_LENGTH: How long the agreement lasts
- RENEWAL: Auto-renewal terms
- JURISDICTION: Governing law

### CONSULTING AGREEMENT TEMPLATE

```
CONSULTING AGREEMENT

Date: [EFFECTIVE_DATE]

CONSULTANT: [CONSULTANT_NAME] ("Consultant")
CLIENT: [CLIENT_NAME] ("Client")

1. CONSULTING SERVICES
Consultant will provide strategic advice and expertise in: [CONSULTING_SCOPE]

2. ENGAGEMENT TYPE
[ ] RETAINER ENGAGEMENT
- Monthly fee: [RETAINER_AMOUNT]
- Included hours: [HOURS_PER_MONTH] hours/month
- Additional hours: Billed at [HOUR_RATE]/hour

[ ] HOURLY ENGAGEMENT
- Rate: [HOUR_RATE]/hour
- Estimated hours: [HOURS_PER_MONTH]/month

3. PAYMENT TERMS
3.1 Retainer payments due: [PAYMENT_DUE]
3.2 Hourly invoices submitted [FREQUENCY - e.g., monthly]
3.3 Payment due within [NET_DAYS] days of invoice.

4. TERM AND RENEWAL
4.1 Initial term: [TERM_LENGTH]
4.2 This Agreement [RENEWAL - auto-renews / may be renewed upon mutual written agreement]

5. CONSULTANT'S RESPONSIBILITIES
5.1 Provide professional advice in Consultant's areas of expertise.
5.2 Maintain confidentiality of Client information.
5.3 Report progress and be available for regular check-ins.

6. CLIENT'S RESPONSIBILITIES
6.1 Provide necessary information and access to complete the engagement.
6.2 Make timely payments.
6.3 Provide feedback within reasonable timeframes.

7. DELIVERABLES
Any written reports, recommendations, or deliverables are included in the fees above.

8. INTELLECTUAL PROPERTY
8.1 Client owns all work product created under this Agreement.
8.2 Consultant retains methodology frameworks and pre-existing IP.

9. LIMITATION OF LIABILITY
Consultant is not liable for business decisions Client makes based on advice.

10. TERMINATION
Either party may terminate with 30 days written notice.
Client pays for all work completed.

11. GOVERNING LAW
[ JURISDICTION ]

[SIGNATURE LINES]
```

---

## QUICK TEMPLATE SYSTEM

For rapid generation, use this format:

```
[TYPE: MSA|SOW|NDA|CONTRACTOR|CONSULTING]
[PROVIDER: X]
[CLIENT: X]
[DATE: X]
[KEY_VALUE_PAIRS: X]
```

The AI will generate the full contract with all standard clauses.