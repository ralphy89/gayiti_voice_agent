## input - Scenario 1 - High Interest

```json
{
  "name": "Marie-Claire Joseph",
  "phone": "+50936123456",
  "business_name": "Vinkode Insurance",
  "preferred_language": "English",
  "context": "Customer's car insurance policy expires in 15 days; she mentioned last month she wanted to renew if the price stayed similar",
  "service": "Car insurance renewal",
  "call_reason": "Confirm the renewal and answer questions about the new premium",
  "email": "mc.joseph@example.com"
}
```

## Output

### Classifier Agent

![Screenshot 15](input1_screenshot/Screenshot%20%2815%29.png)

### Extractor Agent

![Screenshot 16](input1_screenshot/Screenshot%20%2816%29.png)

### Reasoner Agent

![Screenshot 17](input1_screenshot/Screenshot%20%2817%29.png)

### Composer Agent

![Screenshot 18](input1_screenshot/Screenshot%20%2818%29.png)

### Combiner

![Screenshot 19](input1_screenshot/Screenshot%20%2819%29.png)

---

## input Scenario 2 - Medium interest

```json
{
  "name": "Daniel Tremblay",
  "phone": "+15145550277",
  "business_name": "Vinkode Insurance",
  "preferred_language": "English",
  "context": "Customer's car insurance renews in 45 days. He said he's happy with the coverage but is comparing quotes from two competitors before deciding, and asked not to be pressured.",
  "service": "Car insurance renewal",
  "call_reason": "Check whether the customer is leaning toward renewing and address concerns about pricing",
  "email": "d.tremblay@example.com"
}
```

## Output

### Classifier Agent

![Screenshot 20](input2_screenshot/Screenshot%20%2820%29.png)

### Extractor Agent

![Screenshot 21](input2_screenshot/Screenshot%20%2821%29.png)

### Reasoner Agent

![Screenshot 22](input2_screenshot/Screenshot%20%2822%29.png)

### Composer Agent

![Screenshot 23](input2_screenshot/Screenshot%20%2823%29.png)

### Combiner

![Screenshot 24](input2_screenshot/Screenshot%20%2824%29.png)
## input Scenario 3 - Fallback used - bad output from the outbound call node

```json
{
  "name": "James Okafor",
  "phone": "+14165550198",
  "business_name": "BrightPath Media",
  "preferred_language": "English",
  "context": "Cold lead from a webinar signup list; no prior relationship with the company",
  "service": "Premium SEO Package",
  "call_reason": "Gauge interest in upgrading from the free audit to a paid SEO plan",
  "email": "j.okafor@example.com"
}
```

## Output

### Classifier Agent

![Screenshot 26](input3_screenshot/Screenshot%20%2826%29.png)

### Extractor Agent

Same output as the classifier.

### Reasoner Agent

![Screenshot 27](input3_screenshot/Screenshot%20%2827%29.png)

### Composer Agent

![Screenshot 28](input3_screenshot/Screenshot%20%2828%29.png)

### Combiner

![Screenshot 29](input3_screenshot/Screenshot%20%2829%29.png)

