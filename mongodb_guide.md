# Guide Complet MongoDB

## Introduction
MongoDB est une base de données NoSQL orientée documents qui stocke les données au format BSON (Binary JSON). Contrairement aux bases de données SQL traditionnelles, MongoDB offre une grande flexibilité dans la structure des données.

## Structure de Base
- **Base de données** : Conteneur physique pour les collections
- **Collections** : Équivalent des tables SQL
- **Documents** : Équivalent des lignes SQL, stockés en BSON
- **_id** : Identifiant unique automatiquement généré pour chaque document

## Avantages Principaux
1. Flexibilité de la structure des données
2. Scalabilité horizontale (sharding)
3. Performances élevées pour les lectures
4. Excellent support du format JSON
5. Capacité à stocker des données complexes et imbriquées

## Limitations
- Transactions ACID moins complètes que SQL (amélioré dans les versions récentes)
- Cohérence des données moins stricte
- Consommation mémoire plus importante

## Requêtes MongoDB

### Opérations de Base (CRUD)
- **Création** : `insertOne()`, `insertMany()`
- **Lecture** : `find()`, `findOne()`
- **Mise à jour** : `updateOne()`, `updateMany()`
- **Suppression** : `deleteOne()`, `deleteMany()`

### Opérateurs de Comparaison
- `$eq` : égal
- `$gt` : supérieur à
- `$gte` : supérieur ou égal à
- `$lt` : inférieur à
- `$lte` : inférieur ou égal à
- `$in` : dans une liste
- `$nin` : pas dans une liste
- `$ne` : différent de

### Opérateurs Logiques
- `$and` : ET logique
- `$or` : OU logique
- `$not` : négation
- `$nor` : NI (négation du OU)

### Framework d'Agrégation
Le pipeline d'agrégation permet d'effectuer des opérations complexes :
1. `$match` : filtrage
2. `$group` : regroupement
3. `$sort` : tri
4. `$project` : projection
5. `$lookup` : jointures

## Implémentation TypeScript

### Configuration de Base
\`\`\`typescript
import { MongoClient, ObjectId } from 'mongodb';

interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  age: number;
  roles: string[];
  address?: {
    street: string;
    city: string;
    country: string;
  };
}

async function connectToMongoDB() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  await client.connect();
  return client.db('mydb');
}
\`\`\`

### Exemples de Requêtes

#### Création
\`\`\`typescript
const insertResult = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  roles: ['user']
});
\`\`\`

#### Lecture
\`\`\`typescript
// Simple recherche
const user = await users.findOne({ email: 'john@example.com' });

// Recherche avec conditions
const adultUsers = await users.find({
  age: { $gt: 25 },
  roles: { $in: ['user', 'admin'] }
}).toArray();
\`\`\`

#### Mise à jour
\`\`\`typescript
const updateResult = await users.updateOne(
  { email: 'john@example.com' },
  {
    $set: { age: 31 },
    $push: { roles: 'admin' }
  }
);
\`\`\`

#### Suppression
\`\`\`typescript
const deleteResult = await users.deleteOne({
  email: 'john@example.com'
});
\`\`\`

### Requêtes Avancées

#### Agrégation
\`\`\`typescript
const avgAgeByCity = await users.aggregate([
  { $match: { age: { $exists: true } } },
  { $group: {
    _id: '$address.city',
    averageAge: { $avg: '$age' },
    count: { $sum: 1 }
  }},
  { $sort: { averageAge: -1 }}
]).toArray();
\`\`\`

#### Pagination
\`\`\`typescript
const page = 1;
const limit = 10;
const paginatedUsers = await users.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .toArray();
\`\`\`

#### Recherche Géospatiale
\`\`\`typescript
await users.createIndex({ location: '2dsphere' });
const nearbyUsers = await users.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [2.3522, 48.8566] // Paris coordinates
      },
      $maxDistance: 10000 // 10km
    }
  }
}).toArray();
\`\`\`

### Transactions
\`\`\`typescript
async function transactionExample(client: MongoClient) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const db = client.db('mydb');
      const users = db.collection<User>('users');
      
      await users.insertOne({
        name: 'Alice',
        email: 'alice@example.com',
        age: 25,
        roles: ['user']
      }, { session });

      await users.updateOne(
        { email: 'bob@example.com' },
        { $inc: { age: 1 } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}
\`\`\`

## Bonnes Pratiques

### Indexation
1. Créer des index pour les requêtes fréquentes
2. Utiliser des index composés pour les requêtes multi-champs
3. Éviter la création d'index inutiles
4. Surveiller l'utilisation des index

### Performance
1. Limiter la taille des documents
2. Utiliser la projection pour ne récupérer que les champs nécessaires
3. Paginer les résultats volumineux
4. Utiliser des requêtes ciblées plutôt que des scans complets

### Sécurité
1. Utiliser l'authentification
2. Configurer des rôles et permissions appropriés
3. Chiffrer les données sensibles
4. Sauvegarder régulièrement

## Cas d'Usage Idéaux
- Applications nécessitant une grande flexibilité des données
- Systèmes avec beaucoup d'opérations de lecture
- Applications nécessitant une mise à l'échelle horizontale
- Projets manipulant des données JSON/BSON
- Applications temps réel
