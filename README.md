# Todo List - Déploiement avec Minikube

Ce projet est une application **Todo List** basée sur **Node.js** et déployée avec **Kubernetes** sur **Minikube**. Ce guide explique comment déployer l'application dans ton cluster Kubernetes local, en utilisant Minikube pour simuler un environnement de production.

## Prérequis

Avant de commencer, assure-toi d'avoir les éléments suivants installés sur ta machine :

- [Docker](https://www.docker.com/get-started)
- [Minikube](https://minikube.sigs.k8s.io/docs/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [YAML](https://www.yaml.org/) pour les fichiers de configuration Kubernetes

## Étapes pour déployer l'application

### 1. **Configurer Minikube**

Tout d'abord, lance ton cluster Kubernetes local avec Minikube.

```bash
minikube start
```

Cette commande démarre un cluster Kubernetes local avec Minikube. Si tu veux allouer plus de ressources (CPU, RAM), tu peux passer des options comme :

```bash
minikube start --cpus=4 --memory=8192
```

### 2. **Activer le contrôleur Ingress dans Minikube (facultatif)**

Si tu souhaites exposer ton application via un nom d'hôte (comme `todo-list.local`), tu dois activer l'addon Ingress dans Minikube.

```bash
minikube addons enable ingress
```

### 3. **Configurer Docker pour Minikube**

Minikube utilise son propre démon Docker. Pour construire des images Docker dans le même environnement que ton cluster, tu dois configurer ton terminal pour utiliser le Docker daemon de Minikube.

```bash
eval $(minikube docker-env)
```

### 4. **Construire l'image Docker de l'application**

Dans le dossier de ton projet, crée l'image Docker pour ton application **Todo List**.

```bash
docker build -t todo-list-app:latest .
```

### 5. **Créer les fichiers de déploiement Kubernetes**

Dans le dossier `deployment/`, crée les fichiers suivants :

#### `deployment.yaml` : Déploiement de l'application

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-list-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-list-app
  template:
    metadata:
      labels:
        app: todo-list-app
    spec:
      containers:
      - name: todo-list-app
        image: todo-list-app:latest
        ports:
        - containerPort: 3000
```

#### `service.yaml` : Service Kubernetes pour l'application

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-list-service
spec:
  selector:
    app: todo-list-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### `ingress.yaml` : Configuration de l'Ingress (facultatif)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-list-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: todo-list.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: todo-list-service
            port:
              number: 80
```

#### `hpa.yaml` : Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-list-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-list-deployment
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

#### `egress.yaml` : Egress Configuration (pour l'accès sortant)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-egress
spec:
  podSelector:
    matchLabels:
      app: todo-list-app
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
```

### 6. **Appliquer les fichiers YAML dans Kubernetes**

Applique les fichiers YAML pour créer les ressources nécessaires dans ton cluster Kubernetes.

```bash
kubectl apply -f deployment/deployment.yaml
kubectl apply -f deployment/service.yaml
kubectl apply -f deployment/ingress.yaml
kubectl apply -f deployment/hpa.yaml
kubectl apply -f deployment/egress.yaml
```

### 7. **Vérifier le déploiement**

Vérifie que toutes les ressources ont été créées avec succès :

```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
kubectl get hpa
```

### 8. **Accéder à l'application**

#### 8.1. **Via Minikube Service (méthode simple)**

Pour exposer ton service via un port local, tu peux utiliser la commande suivante :

```bash
minikube service todo-list-service
```

Cela ouvrira automatiquement ton navigateur à l'adresse correcte.

Si tu préfères voir l'URL manuellement, utilise :

```bash
minikube service todo-list-service --url
```

#### 8.2. **Via l'Ingress (si configuré)**

Si tu as configuré un Ingress et que tu veux y accéder via un nom d'hôte personnalisé (par exemple, `todo-list.local`), ajoute l'IP de Minikube dans ton fichier `hosts`.

1. Trouve l'IP de Minikube :

   ```bash
   minikube ip
   ```

2. Ajoute cette IP dans ton fichier `hosts` local (`/etc/hosts` sur Linux/Mac ou `C:\Windows\System32\drivers\etc\hosts` sur Windows), et associe-la au nom d'hôte de ton application :

   ```
   127.0.0.1 todo-list.local
   ```

3. Maintenant, ouvre ton navigateur et accède à ton application via l'URL suivante :

   ```
   http://todo-list.local
   ```

#### 8.3. **Via Port Forwarding**

Si tu veux faire un port forwarding pour accéder à ton application sans Ingress, utilise :

```bash
kubectl port-forward pod/todo-list-deployment-xxxxx 3000:3000
```

Puis accède à l'application via `http://127.0.0.1:3000`.

### 9. **Scaler l'application automatiquement avec HPA**

Le **Horizontal Pod Autoscaler (HPA)** ajuste automatiquement le nombre de réplicas de ton application en fonction de l'utilisation du CPU. Tu peux vérifier l'état de l'HPA avec la commande suivante :

```bash
kubectl get hpa
```

### 10. **Supprimer le déploiement (si nécessaire)**

Si tu veux supprimer toutes les ressources Kubernetes créées pour cette application, exécute :

```bash
kubectl delete -f deployment/deployment.yaml
kubectl delete -f deployment/service.yaml
kubectl delete -f deployment/ingress.yaml
kubectl delete -f deployment/hpa.yaml
kubectl delete -f deployment/egress.yaml
```

### Conclusion

Voilà ! Tu as maintenant déployé ton application **Todo List** sur Kubernetes avec **Minikube**. En utilisant Minikube, tu peux tester l'application localement dans un environnement Kubernetes simulé, avec des fonctionnalités comme l'Autoscaling et l'Ingress pour l'accès externe.
# todo-list-app-minikube
