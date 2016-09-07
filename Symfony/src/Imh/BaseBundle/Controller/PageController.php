<?php

namespace Imh\BaseBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class PageController extends Controller
{
    public function detectDevice()
    {
        $mobileDetector = $this->get('mobile_detect.mobile_detector');
        $touchDevice = $mobileDetector->isMobile() || $mobileDetector->isTablet();

        return $touchDevice;
    }

    public function indexAction(Request $request)
    {
        //if($request->isXmlHttpRequest()) {
            return $this->render('ImhBaseBundle:Page:index.html.twig', array(
                'isTouchDevice' => $this->detectDevice()
            ));
        //}
    }

    public function biographyAction()
    {
        return $this->render('ImhBaseBundle:Page:biography.html.twig', array(
            'isTouchDevice' => $this->detectDevice()
        ));
    }

    public function repertoireAction()
    {
        return $this->render('ImhBaseBundle:Page:repertoire.html.twig', array(
            'isTouchDevice' => $this->detectDevice()
        ));
    }
}