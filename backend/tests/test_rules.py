from app.rules import check_compliance, load_rules

rules = load_rules("app/rules.yaml")


def test_mrp_detected():
    result = check_compliance("MRP: Rs. 199 (incl. of all taxes)", rules)
    assert result["mrp"]["present"] is True


def test_mrp_missing():
    result = check_compliance("Net Qty: 500g", rules)
    assert result["mrp"]["present"] is False


def test_net_quantity_detected():
    result = check_compliance("Net Weight: 1kg", rules)
    assert result["net_quantity"]["present"] is True


def test_net_quantity_missing():
    result = check_compliance("MRP: Rs. 199", rules)
    assert result["net_quantity"]["present"] is False


def test_country_of_origin_detected():
    result = check_compliance("Country of Origin: India", rules)
    assert result["country_of_origin"]["present"] is True


def test_country_of_origin_missing():
    result = check_compliance("MRP: Rs. 199, Net Qty: 500g", rules)
    assert result["country_of_origin"]["present"] is False


def test_consumer_care_detected():
    result = check_compliance("Customer Care No: 1800-123-4567", rules)
    assert result["consumer_care"]["present"] is True


def test_consumer_care_missing():
    result = check_compliance("MRP: Rs. 199", rules)
    assert result["consumer_care"]["present"] is False


def test_manufacturer_address_detected_via_pincode():
    result = check_compliance("Balyawala, Bassi, Jaipur (Raj.) 303301", rules)
    assert result["manufacturer_address"]["present"] is True


def test_manufacturer_address_missing():
    result = check_compliance("MRP: Rs. 199", rules)
    assert result["manufacturer_address"]["present"] is False


def test_month_year_detected():
    result = check_compliance("Packed on: 06/2026", rules)
    assert result["month_year"]["present"] is True


def test_month_year_missing():
    result = check_compliance("MRP: Rs. 199", rules)
    assert result["month_year"]["present"] is False


def test_all_rule6_fields_present_in_yaml():
    expected_fields = {
        "mrp",
        "net_quantity",
        "country_of_origin",
        "consumer_care",
        "manufacturer_address",
        "month_year",
    }
    assert expected_fields.issubset(rules.keys())


def test_legal_reference_attached_to_every_field():
    for field, rule in rules.items():
        result = check_compliance("", rules)
        assert result[field]["legal_reference"] == rule["legal_reference"]
