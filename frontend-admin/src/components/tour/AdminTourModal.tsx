import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  MobileStepper,
  Paper,
  Chip,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { useAuth } from '@/features/auth/AuthProvider';

interface TourStep {
  title: string;
  badge: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Bienvenue sur votre Back-Office Admin',
    badge: 'Introduction',
    description:
      'Découvrez votre plateforme de gestion centrale PJ International. Ce guide interactif vous présente en quelques étapes toutes les fonctionnalités mises à votre disposition.',
    details: [
      'Accès sécurisé réservé à l’équipe d’administration',
      'Navigation rapide entre les différents modules via le menu latéral',
      'Alertes et notifications en temps réel en haut à droite',
    ],
    icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#6366f1',
    },
  {
    title: 'Tableau de bord (Dashboard)',
    badge: 'Vue globale',
    description:
      'Visualisez en un coup d’œil les performances en temps réel de votre marketplace et les indicateurs clés.',
    details: [
      'Chiffre d’affaires total, volume de commandes et nouveaux clients',
      'Graphiques d’évolution des ventes quotidiennes et mensuelles',
      'Statistiques sur les vendeurs et produits populaires',
    ],
    icon: <DashboardOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#3b82f6',
  },
  {
    title: 'Gestion du Catalogue (Produits & Catégories)',
    badge: 'Catalogue',
    description:
      'Gérez l’intégralité des articles présentés sur la boutique et organisez l’arborescence des catégories.',
    details: [
      'Ajout, modification, désactivation et suppression de produits',
      'Suivi en temps réel des stocks et des variations de prix',
      'Création et hiérarchisation des catégories de produits',
    ],
    icon: <Inventory2OutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#10b981',
  },
  {
    title: 'Suivi des Commandes',
    badge: 'Ventes',
    description:
      'Consultez et traitez toutes les commandes effectuées par les clients sur la plateforme.',
    details: [
      'Filtrage par statut : En attente, Payée, Expédiée, Livrée ou Annulée',
      'Mise à jour des numéros de suivi et des transporteurs',
      'Détails complets des articles et adresses de livraison',
    ],
    icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#f59e0b',
  },
  {
    title: 'Utilisateurs & Vendeurs Marketplace',
    badge: 'Communauté',
    description:
      'Administrez les comptes clients et validez les candidatures des vendeurs professionnels.',
    details: [
      'Gestion des comptes clients (blocage/déblocage, détails)',
      'Examen et approbation des demandes d’ouverture de boutique vendeur',
      'Consulter le profil et le catalogue spécifique à chaque vendeur',
    ],
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#8b5cf6',
  },
  {
    title: 'Promotions & Demandes de Retrait',
    badge: 'Finance & Marketing',
    description:
      'Stimulez vos ventes avec des réductions et validez les versements de vos vendeurs.',
    details: [
      'Création de codes promo (réduction en % ou en valeur fixe)',
      'Suivi des demandes de virement/retrait soumises par les vendeurs',
      'Validation et historique des paiements effectués',
    ],
    icon: <StorefrontOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#ec4899',
  },
  {
    title: 'Paramètres, Rôles & Profil',
    badge: 'Configuration',
    description:
      'Personnalisez la plateforme, gérez les accès de votre équipe et vos préférences personnelles.',
    details: [
      'Configuration globale des frais de port et intégrations',
      'Création de rôles personnalisés avec permissions granulaires',
      'Menu profil en haut à droite pour relancer ce guide à tout moment',
    ],
    icon: <SettingsOutlinedIcon sx={{ fontSize: 44 }} />,
    color: '#06b6d4',
  },
];

interface AdminTourModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminTourModal({ open, onClose }: AdminTourModalProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  // Re-initialiser le step quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setActiveStep(0);
    }
  }, [open]);

  const maxSteps = TOUR_STEPS.length;
  const currentStep = TOUR_STEPS[activeStep];

  const handleNext = () => {
    if (activeStep < maxSteps - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    if (user?.id) {
      localStorage.setItem(`aquilas_admin_tour_seen_${user.id}`, 'true');
    } else {
      localStorage.setItem('aquilas_admin_tour_seen_guest', 'true');
    }
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          bgcolor: currentStep.color,
          color: '#fff',
          p: 3,
          position: 'relative',
          transition: 'background-color 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentStep.icon}
        </Paper>

        <Box sx={{ flexGrow: 1, pr: 4 }}>
          <Chip
            label={currentStep.badge}
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 11,
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          />
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {currentStep.title}
          </Typography>
        </Box>

        <IconButton
          onClick={handleSkip}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: '#fff',
            bgcolor: 'rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body Content */}
      <DialogContent sx={{ p: 3 }}>
        <Fade key={activeStep} in timeout={300}>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
              {currentStep.description}
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
              Points essentiels :
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {currentStep.details.map((detail, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ color: currentStep.color, fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      </DialogContent>

      {/* Stepper & Actions Footer */}
      <Box
        sx={{
          p: 2,
          px: 3,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <MobileStepper
          variant="progress"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            bgcolor: 'transparent',
            p: 0,
            '& .MuiLinearProgress-root': {
              width: '100%',
              height: 8,
              borderRadius: 4,
              bgcolor: 'action.selected',
            },
            '& .MuiLinearProgress-bar': {
              bgcolor: currentStep.color,
              borderRadius: 4,
              transition: 'all 0.4s ease',
            },
          }}
          backButton={null}
          nextButton={null}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
          <Button
            onClick={handleSkip}
            color="inherit"
            size="small"
            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
          >
            Passer la démo
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBeforeIcon />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Précédent
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleNext}
              endIcon={activeStep === maxSteps - 1 ? null : <NavigateNextIcon />}
              sx={{
                bgcolor: currentStep.color,
                '&:hover': { bgcolor: currentStep.color, filter: 'brightness(0.9)' },
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                borderRadius: 2,
              }}
            >
              {activeStep === maxSteps - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
