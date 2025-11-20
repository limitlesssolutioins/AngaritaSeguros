
import styles from './CotizacionSkeleton.module.css';

const CotizacionSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.flexContainer}>
        <div className={styles.h10w24}></div>
        <div className={styles.h8w32}></div>
      </div>
      <div className={styles.h10w48}></div>
      <div className={styles.spaceY2}>
        <div className={styles.h5wFull}></div>
        <div className={styles.h5w56}></div>
        <div className={styles.h5w34}></div>
      </div>
      <div className={styles.h12wFullRoundedLg}></div>
    </div>
  );
};

export default CotizacionSkeleton;
