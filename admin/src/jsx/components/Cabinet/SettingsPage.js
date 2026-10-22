import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import PageTitle from "../../layouts/PageTitle";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    defaultDuration: "20 min",
    slotInterval: "15 min",
    smsReminders: true,
    emailReminders: true,
    reminderHoursBefore: "24",
    autoBackup: true,
    backupFrequency: "Quotidienne (23:00)",
    sessionTimeout: "30",
    twoFactorAuth: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Paramètres enregistrés",
      text: "Vos préférences de pratique et de sécurité ont été mises à jour.",
      confirmButtonColor: "#1e60d5",
    });
  };

  return (
    <>
      <PageTitle motherMenu="Cabinet et configuration" activeMenu="Paramètres" />

      <div className="card">
        <div className="card-header border-0 pb-0">
          <h4 className="card-title">Paramètres de Gestion du Cabinet Médical</h4>
          <p className="text-muted fs-13 mb-0">Configuration de l'agenda, des rappels patients et de la sécurité</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSave}>
            {/* 1. Préférences Agenda */}
            <h5 className="text-primary font-w600 mb-3 border-bottom pb-2">
              1. Paramètres de l'Agenda & Rendez-vous
            </h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <label className="form-label font-w500">Durée par défaut d'une consultation</label>
                <select
                  className="form-control"
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
                >
                  <option value="15 min">15 minutes</option>
                  <option value="20 min">20 minutes (Standard généraliste)</option>
                  <option value="30 min">30 minutes</option>
                  <option value="45 min">45 minutes</option>
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <label className="form-label font-w500">Intervalle de créneau du calendrier</label>
                <select
                  className="form-control"
                  value={settings.slotInterval}
                  onChange={(e) => setSettings({ ...settings, slotInterval: e.target.value })}
                >
                  <option value="10 min">10 minutes</option>
                  <option value="15 min">15 minutes</option>
                  <option value="20 min">20 minutes</option>
                  <option value="30 min">30 minutes</option>
                </select>
              </div>
            </div>

            {/* 2. Rappels Patients */}
            <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
              2. Rappels Automatiques des Rendez-vous
            </h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="smsRemindCheck"
                    checked={settings.smsReminders}
                    onChange={(e) => setSettings({ ...settings, smsReminders: e.target.checked })}
                  />
                  <label className="form-check-label font-w500 ms-2" htmlFor="smsRemindCheck">
                    Envoyer un rappel par SMS automatique
                  </label>
                </div>
                <small className="text-muted d-block">
                  Réduit les rendez-vous non honorés (lapins) de plus de 70%.
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailRemindCheck"
                    checked={settings.emailReminders}
                    onChange={(e) => setSettings({ ...settings, emailReminders: e.target.checked })}
                  />
                  <label className="form-check-label font-w500 ms-2" htmlFor="emailRemindCheck">
                    Envoyer une confirmation et rappel par Email
                  </label>
                </div>
                <small className="text-muted d-block">
                  Contient les consignes d'accès au cabinet Saint-Honoré.
                </small>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label font-w500">Délai d'envoi du rappel avant le rendez-vous</label>
                <select
                  className="form-control"
                  value={settings.reminderHoursBefore}
                  onChange={(e) => setSettings({ ...settings, reminderHoursBefore: e.target.value })}
                >
                  <option value="24">24 heures avant</option>
                  <option value="48">48 heures avant</option>
                  <option value="72">72 heures avant</option>
                </select>
              </div>
            </div>

            {/* 3. Sécurité & Sauvegardes HDS */}
            <h5 className="text-primary font-w600 mt-4 mb-3 border-bottom pb-2">
              3. Sauvegardes & Sécurité des Données de Santé
            </h5>
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <label className="form-label font-w500">Fréquence de sauvegarde automatique (HDS)</label>
                <select
                  className="form-control"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                >
                  <option value="Quotidienne (23:00)">Quotidienne chaque soir (23:00)</option>
                  <option value="Toutes les 6 heures">Toutes les 6 heures</option>
                  <option value="En temps réel">Chaque clôture de consultation</option>
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <label className="form-label font-w500">Délai d'inactivité avant déconnexion automatique (minutes)</label>
                <select
                  className="form-control"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes (Recommandé)</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" className="btn-rounded">
                <i className="flaticon-381-check-2 me-1"></i> Enregistrer les préférences
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
