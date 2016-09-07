<?php

namespace Application\Sonata\MediaBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GalleryController extends Controller
{
    /**
     * @return boolean $touchDevice
     */
    public function detectDevice()
    {
        $mobileDetector = $this->get('mobile_detect.mobile_detector');
        $touchDevice = $mobileDetector->isMobile() || $mobileDetector->isTablet();

        return $touchDevice;
    }

    /**
     * @return \Symfony\Bundle\FrameworkBundle\Controller\Response
     */
    public function indexAction()
    {
        $galleries = $this->get('sonata.media.manager.gallery')->findBy(array(
            'enabled' => true
        ));

        return $this->render('ApplicationSonataMediaBundle:Gallery:index.html.twig', array(
            'galleries' => $galleries
        ));
    }

    /**
     * @param string $id
     *
     * @return \Symfony\Bundle\FrameworkBundle\Controller\Response
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    public function viewAction($id)
    {
        $gallery = $this->get('sonata.media.manager.gallery')->findOneBy(array(
            'id'      => $id,
            'enabled' => true
        ));

        if (!$gallery) {
            throw new NotFoundHttpException('unable to find the gallery with the id');
        }

        return $this->render('ApplicationSonataMediaBundle:Gallery:view.html.twig', array(
            'gallery'       => $gallery,
            'isTouchDevice' => $this->detectDevice()
        ));
    }
}
