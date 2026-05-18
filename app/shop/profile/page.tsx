"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { euCountries } from "@/lib/vat/eu-vat";

const defaultDeliveryCountries = new Set(["DK", "SE"]);
const defaultShopSlug = "grafisk-handel";

export default function ShopProfilePage() {
  const [saveStatus, setSaveStatus] = useState("");
  const [saveStatusType, setSaveStatusType] = useState<"success" | "error" | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewSlug, setPreviewSlug] = useState(defaultShopSlug);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveStatus("");
    setSaveStatusType("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/shop/profile", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errorMessage ?? result.error ?? `Profile save failed with status ${response.status}.`);
      }

      setPreviewSlug(result.slug ?? slugify(String(formData.get("shopName") ?? defaultShopSlug)));
      setSaveStatusType("success");
      setSaveStatus(`Saved. This shop delivers to ${result.deliveryCountries.length} EU countries.`);
    } catch (error) {
      setSaveStatusType("error");
      setSaveStatus(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="shell">
      <section className="panel">
        <h1>Shop profile</h1>
        <p className="muted">
          This public shop profile is used for logos, offer pages, contact details, and trust information.
        </p>
        <form className="admin-form" onSubmit={saveProfile}>
          <div className="field-grid">
            <label>
              <span>Shop name</span>
              <input
                name="shopName"
                defaultValue="Grafisk Handel"
                onChange={(event) => setPreviewSlug(slugify(event.target.value || defaultShopSlug))}
              />
            </label>
            <label><span>Website URL</span><input name="websiteUrl" defaultValue="https://www.grafisk-handel.dk" /></label>
            <label>
              <span>Shop country for VAT</span>
              <select name="countryCode" defaultValue="DK">
                <option value="AT">Austria</option>
                <option value="BE">Belgium</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="CY">Cyprus</option>
                <option value="CZ">Czech Republic</option>
                <option value="DK">Denmark</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="GR">Greece</option>
                <option value="HU">Hungary</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="LV">Latvia</option>
                <option value="LT">Lithuania</option>
                <option value="LU">Luxembourg</option>
                <option value="MT">Malta</option>
                <option value="NL">Netherlands</option>
                <option value="PL">Poland</option>
                <option value="PT">Portugal</option>
                <option value="RO">Romania</option>
                <option value="SK">Slovakia</option>
                <option value="SI">Slovenia</option>
                <option value="ES">Spain</option>
                <option value="SE">Sweden</option>
              </select>
            </label>
            <label><span>Contact email</span><input name="contactEmail" defaultValue="info@grafisk-handel.dk" /></label>
            <label><span>Contact phone</span><input name="contactPhone" defaultValue="+45 00 00 00 00" /></label>
          </div>
          <label>
            <span>Shop logo</span>
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
          </label>
          <label>
            <span>Logo URL for preview</span>
            <input name="logoUrl" defaultValue="https://www.google.com/s2/favicons?domain=www.grafisk-handel.dk&sz=128" />
          </label>
          <label>
            <span>Short shop description</span>
            <textarea
              name="description"
              maxLength={7000}
              defaultValue="Grafisk Handel supplies professional print, ink, media, and production products to businesses across Denmark and selected EU markets."
            />
          </label>
          <p className="muted">Maximum 1000 words. Keep it factual, useful, and written for shoppers comparing offers.</p>

          <section className="delivery-country-section" aria-labelledby="delivery-countries-heading">
            <div>
              <h2 id="delivery-countries-heading">We deliver to these countries</h2>
              <p className="muted">
                Select every EU country where shoppers can order from this shop. Product offers are only shown to shoppers from selected countries.
              </p>
            </div>
            <div className="country-checkbox-grid">
              {euCountries.map((country) => (
                <label className="country-checkbox" key={country.code}>
                  <input
                    name="deliveryCountries"
                    type="checkbox"
                    value={country.code}
                    defaultChecked={defaultDeliveryCountries.has(country.code)}
                  />
                  <span className="country-flag" aria-hidden="true">{country.flag}</span>
                  <span>{country.name}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="admin-actions">
            <button className="button" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save profile"}
            </button>
            <Link className="secondary-button" href={`/shops/${previewSlug}`}>Preview public profile</Link>
          </div>
          {saveStatus ? (
            <div className={saveStatusType === "error" ? "error-item" : "success-box"} role="status">
              {saveStatus}
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e6/g, "ae")
    .replace(/\u00f8/g, "oe")
    .replace(/\u00e5/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
