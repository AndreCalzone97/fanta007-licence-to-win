from app.providers.wikimedia_player_image_provider import _identity_score, image_from_page


def page_with_license(license_name: str, non_free: str = "False"):
    return {"imageinfo": [{"url": "https://upload.wikimedia.org/photo.jpg", "thumburl": "https://upload.wikimedia.org/thumb.jpg", "descriptionurl": "https://commons.wikimedia.org/wiki/File:Photo.jpg", "extmetadata": {"LicenseShortName": {"value": license_name}, "Artist": {"value": "<a>Test Author</a>"}, "NonFree": {"value": non_free}}}]}


def test_accepts_attributed_commons_license():
    image = image_from_page(page_with_license("CC BY-SA 4.0"))
    assert image is not None
    assert image.author == "Test Author"
    assert image.thumbnail_url
    assert image.portrait_approved is False
    assert image.status == "pending"


def test_rejects_unknown_or_non_free_license():
    assert image_from_page(page_with_license("All rights reserved")) is None
    assert image_from_page(page_with_license("CC BY 4.0", "True")) is None


def test_identity_score_requires_player_name_in_file_metadata():
    correct = page_with_license("CC BY-SA 4.0")
    correct["title"] = "File:Manuel Locatelli Juventus 2025.jpg"
    wrong = page_with_license("CC BY-SA 4.0")
    wrong["title"] = "File:Another football player.jpg"

    assert _identity_score(correct, "Manuel Locatelli", "Juventus") == 0.92
    assert _identity_score(wrong, "Manuel Locatelli", "Juventus") == 0.0
