import React, { useState } from "react";
import {
  FileText,
  ShieldAlert,
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { DEFAULT_RULES } from "../../services/defaultData";

export default function RulesSection({ rules = DEFAULT_RULES }) {
  const [activeTab, setActiveTab] = useState(0);

  const icons = [FileText, RotateCcw, Clock, Sparkles, ShieldAlert];

  return (
    <section id="rules" className="section rules-section bg-light-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Guidelines & Terms</span>
          <h2 className="section-title">Hall Rules & Booking Policies</h2>
          <p className="section-subtitle">
            To ensure a seamless, joyous, and secure environment for all guests, please review our hall operational guidelines.
          </p>
        </div>

        <div className="rules-layout-grid">
          {/* Rules Category Tabs */}
          <div className="rules-nav-column">
            {rules.map((ruleCategory, idx) => {
              const TabIcon = icons[idx % icons.length];
              return (
                <button
                  key={idx}
                  type="button"
                  className={`rule-tab-btn ${activeTab === idx ? "active" : ""}`}
                  onClick={() => setActiveTab(idx)}
                >
                  <TabIcon size={18} className="rule-tab-icon" />
                  <span>{ruleCategory.category}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Rules Content */}
          <div className="rules-content-card card">
            <div className="rules-content-header">
              <h3 className="rules-category-title">{rules[activeTab]?.category}</h3>
              <span className="rules-count-badge">
                {rules[activeTab]?.items?.length || 0} Key Provisions
              </span>
            </div>

            <ul className="rules-list">
              {rules[activeTab]?.items?.map((item, index) => (
                <li key={index} className="rule-list-item">
                  <div className="rule-bullet-wrap">
                    <CheckCircle2 size={18} className="rule-bullet-icon" />
                  </div>
                  <p className="rule-text">{item}</p>
                </li>
              ))}
            </ul>

            <div className="rules-footer-alert">
              <AlertTriangle size={18} className="rules-alert-icon" />
              <p>
                Compliance with state safety regulations and decibel limits is mandatory. Failure to adhere may forfeit the refundable security deposit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
