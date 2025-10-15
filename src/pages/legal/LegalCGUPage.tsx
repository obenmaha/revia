// Page des conditions générales d'utilisation - NFR5
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Users, CreditCard, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';

export function LegalCGUPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Conditions générales d'utilisation</h1>
          </div>
        </div>

        {/* Avertissement important */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Important</h3>
                <p className="text-amber-700 text-sm">
                  En utilisant l'application Revia, vous acceptez sans réserve les présentes conditions générales d'utilisation. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="space-y-4 sm:space-y-6">
          {/* Article 1 - Objet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Article 1 - Objet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions 
                d'utilisation de l'application Revia, service de suivi d'activités sportives et de gestion de cabinet de kinésithérapie.
              </p>
              
              <p className="text-gray-700">
                L'application Revia est éditée par la société Revia Application, SAS au capital de 10 000 €, 
                immatriculée au RCS de Paris sous le numéro 123 456 789, dont le siège social est situé au 123 Avenue des Champs-Élysées, 75008 Paris.
              </p>
            </CardContent>
          </Card>

          {/* Article 2 - Définitions */}
          <Card>
            <CardHeader>
              <CardTitle>Article 2 - Définitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Application</h4>
                  <p className="text-gray-700 text-sm">Désigne l'application Revia accessible via navigateur web et applications mobiles.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Utilisateur</h4>
                  <p className="text-gray-700 text-sm">Toute personne physique ou morale utilisant l'application Revia.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Compte utilisateur</h4>
                  <p className="text-gray-700 text-sm">Espace personnel de l'utilisateur permettant l'accès aux fonctionnalités de l'application.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Données personnelles</h4>
                  <p className="text-gray-700 text-sm">Toute information relative à une personne physique identifiée ou identifiable.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article 3 - Acceptation des CGU */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Article 3 - Acceptation des CGU
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'utilisation de l'application Revia implique l'acceptation pleine et entière des présentes CGU. 
                Ces conditions s'appliquent à tous les utilisateurs de l'application.
              </p>
              
              <p className="text-gray-700">
                Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application. 
                L'utilisation de l'application vaut acceptation des présentes CGU.
              </p>
            </CardContent>
          </Card>

          {/* Article 4 - Inscription et compte utilisateur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Article 4 - Inscription et compte utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.1 Inscription</h4>
                <p className="text-gray-700">
                  L'inscription à l'application est gratuite et facultative. L'utilisateur peut également utiliser l'application en mode invité.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.2 Informations requises</h4>
                <p className="text-gray-700">
                  Lors de l'inscription, l'utilisateur s'engage à fournir des informations exactes, complètes et à jour. 
                  Toute information erronée peut entraîner la suspension ou la suppression du compte.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.3 Sécurité du compte</h4>
                <p className="text-gray-700">
                  L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. 
                  Il s'engage à ne pas les communiquer à des tiers et à nous informer immédiatement de toute utilisation non autorisée.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 5 - Fonctionnalités de l'application */}
          <Card>
            <CardHeader>
              <CardTitle>Article 5 - Fonctionnalités de l'application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.1 Fonctionnalités disponibles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Suivi d'activités sportives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Gestion de cabinet de kinésithérapie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Mode invité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Statistiques et rapports</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.2 Évolution des fonctionnalités</h4>
                <p className="text-gray-700">
                  Revia se réserve le droit de modifier, suspendre ou supprimer toute fonctionnalité de l'application 
                  sans préavis et sans indemnité.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 6 - Utilisation de l'application */}
          <Card>
            <CardHeader>
              <CardTitle>Article 6 - Utilisation de l'application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.1 Utilisation conforme</h4>
                <p className="text-gray-700">
                  L'utilisateur s'engage à utiliser l'application de manière conforme à sa destination et aux présentes CGU. 
                  Il s'interdit notamment de :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Utiliser l'application à des fins illégales ou non autorisées</li>
                  <li>Porter atteinte aux droits de tiers</li>
                  <li>Transmettre des contenus illicites, offensants ou inappropriés</li>
                  <li>Tenter de contourner les mesures de sécurité</li>
                  <li>Utiliser des robots ou scripts automatisés</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.2 Responsabilité de l'utilisateur</h4>
                <p className="text-gray-700">
                  L'utilisateur est seul responsable de l'utilisation qu'il fait de l'application et des conséquences qui en découlent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 7 - Protection des données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Article 7 - Protection des données personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Le traitement des données personnelles est régi par notre politique de confidentialité, 
                conforme au Règlement Général sur la Protection des Données (RGPD).
              </p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7.1 Données collectées</h4>
                <p className="text-gray-700">
                  Nous collectons uniquement les données nécessaires au fonctionnement de l'application : 
                  informations de profil, données d'activité sportive, préférences utilisateur.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">7.2 Droits de l'utilisateur</h4>
                <p className="text-gray-700">
                  L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition 
                  concernant ses données personnelles.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 8 - Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Article 8 - Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'application Revia et tous ses éléments (textes, images, logos, design, code source) 
                sont protégés par le droit de la propriété intellectuelle et appartiennent à Revia Application.
              </p>
              
              <p className="text-gray-700">
                L'utilisateur ne peut pas reproduire, modifier, distribuer ou exploiter l'application 
                sans autorisation écrite préalable.
              </p>
            </CardContent>
          </Card>

          {/* Article 9 - Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>Article 9 - Responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">9.1 Limitation de responsabilité</h4>
                <p className="text-gray-700">
                  Revia ne peut être tenue responsable des dommages indirects, perte de données, 
                  perte de profits ou interruption d'activité résultant de l'utilisation de l'application.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">9.2 Disponibilité du service</h4>
                <p className="text-gray-700">
                  Revia s'efforce d'assurer la disponibilité de l'application 24h/24 et 7j/7, 
                  mais ne peut garantir une disponibilité absolue.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 10 - Modification des CGU */}
          <Card>
            <CardHeader>
              <CardTitle>Article 10 - Modification des CGU</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Revia se réserve le droit de modifier les présentes CGU à tout moment. 
                Les modifications entrent en vigueur dès leur publication sur l'application.
              </p>
              
              <p className="text-gray-700">
                L'utilisation continue de l'application après modification des CGU vaut acceptation 
                des nouvelles conditions.
              </p>
            </CardContent>
          </Card>

          {/* Article 11 - Résiliation */}
          <Card>
            <CardHeader>
              <CardTitle>Article 11 - Résiliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11.1 Résiliation par l'utilisateur</h4>
                <p className="text-gray-700">
                  L'utilisateur peut supprimer son compte à tout moment depuis les paramètres de l'application.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11.2 Résiliation par Revia</h4>
                <p className="text-gray-700">
                  Revia peut suspendre ou supprimer le compte d'un utilisateur en cas de violation des CGU, 
                  avec ou sans préavis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 12 - Droit applicable et juridiction */}
          <Card>
            <CardHeader>
              <CardTitle>Article 12 - Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Les présentes CGU sont soumises au droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
              
              <p className="text-gray-700">
                En cas de litige, les parties s'efforceront de trouver une solution amiable 
                avant de saisir les tribunaux.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">
                Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
              </p>
              <div className="space-y-1">
                <p className="text-gray-700">
                  <strong>Email :</strong> 
                  <a href="mailto:legal@revia-app.com" className="text-blue-600 hover:text-blue-800 underline ml-1">
                    legal@revia-app.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dernière mise à jour */}
          <Card>
            <CardHeader>
              <CardTitle>Dernière mise à jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Dernière mise à jour des présentes CGU : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LegalCGUPage;
