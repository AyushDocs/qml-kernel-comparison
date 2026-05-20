import json
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.datasets import make_moons, make_circles
from scipy.linalg import eigh

from quantum_kernel import quantum_kernel_matrix


def rbf_kernel(X, Y=None, gamma=1.0):
    if Y is None:
        Y = X
    sq_dists = np.sum(X ** 2, axis=1)[:, np.newaxis] + np.sum(Y ** 2, axis=1) - 2 * X @ Y.T
    return np.exp(-gamma * np.clip(sq_dists, 0, None))


def poly_kernel(X, Y=None, degree=3, gamma=1.0, coef0=1.0):
    if Y is None:
        Y = X
    return (gamma * X @ Y.T + coef0) ** degree


def centered_kernel_alignment(K1, K2):
    n = K1.shape[0]
    H = np.eye(n) - np.ones((n, n)) / n
    K1_c = H @ K1 @ H
    K2_c = H @ K2 @ H
    num = np.sum(K1_c * K2_c)
    den = np.sqrt(np.sum(K1_c * K1_c) * np.sum(K2_c * K2_c))
    return num / den if den > 0 else 0.0


def kernel_eigenspectrum(K, n_eigvals=None):
    n = K.shape[0]
    if n_eigvals is None:
        n_eigvals = n
    result = eigh(K, subset_by_index=[n - n_eigvals, n - 1])
    if isinstance(result, tuple):
        eigvals = result[0]
    else:
        eigvals = result
    return np.sort(eigvals)[::-1]


def run_experiment(
    dataset="moons",
    n_samples=200,
    noise=0.15,
    test_size=0.3,
    random_state=42,
    gamma_values=[0.1, 0.5, 1.0, 2.0, 5.0],
):
    np.random.seed(random_state)

    if dataset == "moons":
        X, y = make_moons(n_samples=n_samples, noise=noise, random_state=random_state)
    elif dataset == "circles":
        X, y = make_circles(n_samples=n_samples, noise=noise, factor=0.5, random_state=random_state)
    else:
        raise ValueError(f"Unknown dataset: {dataset}")

    X = (X - X.mean(axis=0)) / X.std(axis=0)
    y = 2 * y - 1

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    results = {
        "dataset": dataset,
        "n_samples": n_samples,
        "noise": noise,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "kernels": {},
        "alignment": {},
        "eigenspectra": {},
    }

    # --- Quantum kernel ---
    K_train_q = quantum_kernel_matrix(X_train)
    K_test_q = quantum_kernel_matrix(X_test, X_train)

    svm_q = SVC(kernel="precomputed", random_state=random_state)
    svm_q.fit(K_train_q, y_train)
    y_pred_q = svm_q.predict(K_test_q)
    acc_q = float(accuracy_score(y_test, y_pred_q))

    results["kernels"]["quantum"] = {
        "accuracy": acc_q,
        "train_gram_trace": float(np.trace(K_train_q) / len(K_train_q)),
        "n_support": int(np.sum(svm_q.n_support_)),
    }
    results["alignment"]["quantum_vs_quantum"] = 1.0

    # --- Classical kernels with hyperparameter sweep ---
    best_rbf_acc = 0.0
    best_poly_acc = 0.0
    best_rbf_gamma = gamma_values[0]
    best_poly_params = {}

    for gamma in gamma_values:
        K_train_rbf = rbf_kernel(X_train, gamma=gamma)
        K_test_rbf = rbf_kernel(X_test, X_train, gamma=gamma)
        svm_rbf = SVC(kernel="precomputed", random_state=random_state)
        svm_rbf.fit(K_train_rbf, y_train)
        acc_rbf = float(accuracy_score(y_test, svm_rbf.predict(K_test_rbf)))
        if acc_rbf > best_rbf_acc:
            best_rbf_acc = acc_rbf
            best_rbf_gamma = gamma

        for degree in [2, 3, 4]:
            for coef0 in [0.0, 1.0]:
                K_train_p = poly_kernel(X_train, degree=degree, gamma=gamma, coef0=coef0)
                K_test_p = poly_kernel(X_test, X_train, degree=degree, gamma=gamma, coef0=coef0)
                svm_p = SVC(kernel="precomputed", random_state=random_state)
                svm_p.fit(K_train_p, y_train)
                acc_p = float(accuracy_score(y_test, svm_p.predict(K_test_p)))
                if acc_p > best_poly_acc:
                    best_poly_acc = acc_p
                    best_poly_params = {"gamma": gamma, "degree": degree, "coef0": coef0}

    # Run best kernels
    K_train_rbf = rbf_kernel(X_train, gamma=best_rbf_gamma)
    K_test_rbf = rbf_kernel(X_test, X_train, gamma=best_rbf_gamma)
    svm_rbf = SVC(kernel="precomputed", random_state=random_state)
    svm_rbf.fit(K_train_rbf, y_train)
    y_pred_rbf = svm_rbf.predict(K_test_rbf)
    acc_rbf = float(accuracy_score(y_test, y_pred_rbf))

    results["kernels"]["rbf"] = {
        "accuracy": acc_rbf,
        "best_gamma": best_rbf_gamma,
        "train_gram_trace": float(np.trace(K_train_rbf) / len(K_train_rbf)),
        "n_support": int(np.sum(svm_rbf.n_support_)),
    }

    K_train_p = poly_kernel(X_train, **best_poly_params)
    K_test_p = poly_kernel(X_test, X_train, **best_poly_params)
    svm_poly = SVC(kernel="precomputed", random_state=random_state)
    svm_poly.fit(K_train_p, y_train)
    y_pred_poly = svm_poly.predict(K_test_p)
    acc_poly = float(accuracy_score(y_test, y_pred_poly))

    results["kernels"]["polynomial"] = {
        "accuracy": acc_poly,
        "best_params": best_poly_params,
        "train_gram_trace": float(np.trace(K_train_p) / len(K_train_p)),
        "n_support": int(np.sum(svm_poly.n_support_)),
    }

    # --- Kernel geometry analysis ---
    results["alignment"]["quantum_vs_rbf"] = float(
        centered_kernel_alignment(K_train_q, K_train_rbf)
    )
    results["alignment"]["quantum_vs_poly"] = float(
        centered_kernel_alignment(K_train_q, K_train_p)
    )
    results["alignment"]["rbf_vs_poly"] = float(
        centered_kernel_alignment(K_train_rbf, K_train_p)
    )

    # --- Eigenspectra (top 20 eigenvalues) ---
    n_eig = min(20, len(K_train_q))
    results["eigenspectra"]["quantum"] = [float(v) for v in kernel_eigenspectrum(K_train_q, n_eig)]
    results["eigenspectra"]["rbf"] = [float(v) for v in kernel_eigenspectrum(K_train_rbf, n_eig)]
    results["eigenspectra"]["polynomial"] = [float(v) for v in kernel_eigenspectrum(K_train_p, n_eig)]

    # --- Store kernel matrices as lists (for frontend heatmaps) ---
    n_show = min(50, len(K_train_q))
    results["kernel_matrices"] = {
        "quantum": K_train_q[:n_show, :n_show].tolist(),
        "rbf": K_train_rbf[:n_show, :n_show].tolist(),
        "polynomial": K_train_p[:n_show, :n_show].tolist(),
    }

    # --- Store coordinates & labels (for frontend scatter) ---
    results["data"] = {
        "X_train": X_train.tolist(),
        "y_train": y_train.tolist(),
        "X_test": X_test.tolist(),
        "y_test": y_test.tolist(),
    }

    # --- Decision boundary grid (for frontend) ---
    results["decision_boundary"] = compute_decision_boundary(
        X_train, y_train, X_test, y_test, K_train_q, K_test_q,
        K_train_rbf, K_test_rbf, K_train_p, K_test_p,
        best_rbf_gamma, best_poly_params, random_state
    )

    return results


def compute_decision_boundary(
    X_train, y_train, X_test, y_test,
    K_train_q, K_test_q,
    K_train_rbf, K_test_rbf,
    K_train_p, K_test_p,
    best_rbf_gamma, best_poly_params, random_state
):
    x_min, x_max = X_train[:, 0].min() - 0.5, X_train[:, 0].max() + 0.5
    y_min, y_max = X_train[:, 1].min() - 0.5, X_train[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 25), np.linspace(y_min, y_max, 25))
    grid_points = np.c_[xx.ravel(), yy.ravel()]

    boundaries = {"grid": {"x": xx.tolist(), "y": yy.tolist()}, "Z": {}}

    from quantum_kernel import quantum_kernel_matrix
    K_grid_q = quantum_kernel_matrix(grid_points, X_train)
    svm_q = SVC(kernel="precomputed", random_state=random_state)
    svm_q.fit(K_train_q, y_train)
    boundaries["Z"]["quantum"] = svm_q.predict(K_grid_q).reshape(xx.shape).tolist()

    K_grid_rbf = rbf_kernel(grid_points, X_train, gamma=best_rbf_gamma)
    svm_rbf = SVC(kernel="precomputed", random_state=random_state)
    svm_rbf.fit(K_train_rbf, y_train)
    boundaries["Z"]["rbf"] = svm_rbf.predict(K_grid_rbf).reshape(xx.shape).tolist()

    K_grid_p = poly_kernel(grid_points, X_train, **best_poly_params)
    svm_poly = SVC(kernel="precomputed", random_state=random_state)
    svm_poly.fit(K_train_p, y_train)
    boundaries["Z"]["polynomial"] = svm_poly.predict(K_grid_p).reshape(xx.shape).tolist()

    return boundaries


if __name__ == "__main__":
    print("Running quantum vs classical kernel experiment...")

    for dataset in ["moons", "circles"]:
        print(f"\n{'='*60}")
        print(f"Dataset: {dataset}")
        print(f"{'='*60}")
        results = run_experiment(dataset=dataset, n_samples=200, noise=0.15)

        for name, k in results["kernels"].items():
            print(f"  {name:12s}: accuracy = {k['accuracy']:.3f}")

        print(f"\n  Centered Kernel Alignment:")
        for pair, val in results["alignment"].items():
            if val != 1.0:
                print(f"    {pair:20s}: {val:.4f}")

    print("\nSaving results to results.json...")
    results = {
        "moons": run_experiment(dataset="moons", n_samples=200, noise=0.15),
        "circles": run_experiment(dataset="circles", n_samples=200, noise=0.15),
    }
    output_path = "frontend/public/results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Done. Results saved to {output_path}")
