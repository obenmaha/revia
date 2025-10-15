// Page des mentions légales - NFR5
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Building, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

export function LegalMentionsPage() {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mentions légales</h1>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-4 sm:space-y-6">
          {/* Éditeur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Raison sociale</h3>
                <p className="text-gray-700">Revia Application</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Forme juridique</h3>
                <p className="text-gray-700">Société par actions simplifiée (SAS)</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Capital social</h3>
                <p className="text-gray-700">10 000 €</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">RCS</h3>
                <p className="text-gray-700">Paris B 123 456 789</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">SIRET</h3>
                <p className="text-gray-700">123 456 789 00012</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Code APE</h3>
                <p className="text-gray-700">6201Z - Programmation informatique</p>
              </div>
            </CardContent>
          </Card>

          {/* Siège social */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Siège social
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-700">123 Avenue des Champs-Élysées</p>
                <p className="text-gray-700">75008 Paris</p>
                <p className="text-gray-700">France</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <a 
                  href="mailto:contact@revia-app.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  contact@revia-app.com
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <a 
                  href="tel:+33123456789" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  +33 1 23 45 67 89
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Directeur de publication */}
          <Card>
            <CardHeader>
              <CardTitle>Directeur de publication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">M. Jean Dupont, Président</p>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle>Hébergement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Hébergeur</h3>
                <p className="text-gray-700">Vercel Inc.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
                <p className="text-gray-700">340 S Lemon Ave #4133</p>
                <p className="text-gray-700">Walnut, CA 91789</p>
                <p className="text-gray-700">États-Unis</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Site web</h3>
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  https://vercel.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              
              <p className="text-gray-700">
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
              
              <p className="text-gray-700">
                La marque et le logo de Revia Application sont des marques déposées. Toute reproduction non autorisée de ces marques, dessins et modèles constitue une contrefaçon passible de sanctions pénales.
              </p>
            </CardContent>
          </Card>

          {/* Protection des données */}
          <Card>
            <CardHeader>
              <CardTitle>Protection des données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant.
              </p>
              
              <p className="text-gray-700">
                Pour exercer ce droit, vous pouvez nous contacter à l'adresse : 
                <a 
                  href="mailto:dpo@revia-app.com" 
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  dpo@revia-app.com
                </a>
              </p>
              
              <p className="text-gray-700">
                Les données collectées sur ce site sont traitées de manière confidentielle et ne sont pas transmises à des tiers sans votre consentement explicite.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Ce site utilise des cookies techniques nécessaires au bon fonctionnement de l'application. 
                Ces cookies ne nécessitent pas de consentement préalable.
              </p>
              
              <p className="text-gray-700">
                Des cookies analytiques peuvent également être utilisés pour améliorer l'expérience utilisateur. 
                Vous pouvez les désactiver dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle>Droit applicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </CardContent>
          </Card>

          {/* Dernière mise à jour */}
          <Card>
            <CardHeader>
              <CardTitle>Dernière mise à jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Dernière mise à jour des présentes mentions légales : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LegalMentionsPage;
