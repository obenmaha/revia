import { TestService } from '../services/testService';

// Script de test pour vérifier la configuration Supabase
async function testSupabase() {
  console.log('🔍 Test de la configuration Supabase...\n');

  try {
    const result = await TestService.testDatabase();

    console.log('📊 Résultats des tests:');
    console.log('====================');

    // Test de connexion
    console.log(
      `🔌 Connexion Supabase: ${result.results.connection.success ? '✅' : '❌'}`
    );
    console.log(`   Message: ${result.results.connection.message}`);

    // Test RLS
    console.log(
      `🔒 Politiques RLS: ${result.results.rls.success ? '✅' : '❌'}`
    );
    console.log(`   Message: ${result.results.rls.message}`);

    if (result.results.rls.success) {
      console.log(`   Utilisateurs trouvés: ${result.results.rls.usersCount}`);
      console.log(`   Patients trouvés: ${result.results.rls.patientsCount}`);
    }

    console.log('\n📈 Résultat global:');
    console.log('==================');
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);

    if (result.success) {
      console.log('\n🎉 Configuration Supabase prête pour le développement !');
    } else {
      console.log(
        '\n⚠️  Des problèmes ont été détectés. Vérifiez la configuration.'
      );
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exécuter le test si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabase();
}

export { testSupabase };
