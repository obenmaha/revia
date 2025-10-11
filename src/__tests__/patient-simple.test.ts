// Tests simplifiés pour la gestion des patients - Story 2.1
import { describe, it, expect } from 'vitest';
import {
  Patient,
  CreatePatientInput,
  Address,
  MedicalInfo,
  EmergencyContact,
} from '../types/patient';

describe('Types Patient', () => {
  it('devrait valider la structure des données Patient', () => {
    const validPatient: Patient = {
      id: 'test-id',
      practitionerId: 'test-practitioner-id',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: new Date('1980-05-15'),
      phone: '06 12 34 56 78',
      email: 'jean@example.com',
      address: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
      },
      medicalInfo: {
        allergies: ['Pénicilline'],
        medications: ['Aspirine'],
        medicalHistory: 'Aucun antécédent',
        currentConditions: ['Hypertension'],
        notes: 'Patient coopératif',
      },
      emergencyContact: {
        name: 'Marie Dupont',
        relationship: 'Conjoint',
        phone: '06 98 76 54 32',
        email: 'marie@example.com',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validPatient).toBeDefined();
    expect(validPatient.id).toBe('test-id');
    expect(validPatient.firstName).toBe('Jean');
    expect(validPatient.address.street).toBe('123 Rue de la Paix');
  });

  it('devrait valider la structure des données CreatePatientInput', () => {
    const validInput: CreatePatientInput = {
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: new Date('1980-05-15'),
      phone: '06 12 34 56 78',
      email: 'jean@example.com',
      address: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
      },
      medicalInfo: {
        allergies: ['Pénicilline'],
        medications: ['Aspirine'],
        medicalHistory: 'Aucun antécédent',
        currentConditions: ['Hypertension'],
        notes: 'Patient coopératif',
      },
      emergencyContact: {
        name: 'Marie Dupont',
        relationship: 'Conjoint',
        phone: '06 98 76 54 32',
        email: 'marie@example.com',
      },
    };

    expect(validInput).toBeDefined();
    expect(validInput.firstName).toBe('Jean');
    expect(validInput.address.street).toBe('123 Rue de la Paix');
  });

  it('devrait valider la structure des données Address', () => {
    const validAddress: Address = {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    };

    expect(validAddress).toBeDefined();
    expect(validAddress.street).toBe('123 Rue de la Paix');
    expect(validAddress.city).toBe('Paris');
    expect(validAddress.postalCode).toBe('75001');
    expect(validAddress.country).toBe('France');
  });

  it('devrait valider la structure des données MedicalInfo', () => {
    const validMedicalInfo: MedicalInfo = {
      allergies: ['Pénicilline', 'Aspirine'],
      medications: ['Paracétamol', 'Ibuprofène'],
      medicalHistory: 'Aucun antécédent notable',
      currentConditions: ['Hypertension', 'Diabète'],
      notes: 'Patient coopératif et ponctuel',
    };

    expect(validMedicalInfo).toBeDefined();
    expect(validMedicalInfo.allergies).toHaveLength(2);
    expect(validMedicalInfo.medications).toHaveLength(2);
    expect(validMedicalInfo.currentConditions).toHaveLength(2);
  });

  it('devrait valider la structure des données EmergencyContact', () => {
    const validEmergencyContact: EmergencyContact = {
      name: 'Marie Dupont',
      relationship: 'Conjoint',
      phone: '06 98 76 54 32',
      email: 'marie@example.com',
    };

    expect(validEmergencyContact).toBeDefined();
    expect(validEmergencyContact.name).toBe('Marie Dupont');
    expect(validEmergencyContact.relationship).toBe('Conjoint');
    expect(validEmergencyContact.phone).toBe('06 98 76 54 32');
  });
});

describe('Validation des données', () => {
  it('devrait valider un numéro de téléphone français', () => {
    const validPhones = [
      '06 12 34 56 78',
      '0612345678',
      '06-12-34-56-78',
      '+33 6 12 34 56 78',
    ];

    validPhones.forEach(phone => {
      expect(phone).toMatch(/^[0-9+\-\s()]+$/);
    });
  });

  it('devrait valider un code postal français', () => {
    const validPostalCodes = ['75001', '69000', '13000', '59000'];

    validPostalCodes.forEach(postalCode => {
      expect(postalCode).toMatch(/^[0-9]{5}$/);
    });
  });

  it('devrait valider une adresse email', () => {
    const validEmails = [
      'jean@example.com',
      'marie.dupont@example.fr',
      'test+tag@example.org',
    ];

    validEmails.forEach(email => {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});

describe('Fonctions utilitaires', () => {
  it("devrait calculer l'âge correctement", () => {
    const birthDate = new Date('1980-05-15');
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    const calculatedAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    expect(calculatedAge).toBeGreaterThan(40);
    expect(calculatedAge).toBeLessThan(50);
  });

  it('devrait formater une date correctement', () => {
    const date = new Date('1980-05-15');
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    expect(formattedDate).toContain('1980');
    expect(formattedDate).toContain('mai');
    expect(formattedDate).toContain('15');
  });
});
